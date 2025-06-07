const { Op } = require('sequelize');
const Invoice = require('../models/invoiceModel');
const Client = require('../models/clientModel');
const Currency = require('../models/currencyModel');
const Employee = require('../models/employeeModel');
const BillingDetail = require('../models/billingDetailModel');
const ClientEmployee = require('../models/clientEmployeeModel');
const BankDetail = require('../models/bankDetailModel');
const Organisation = require('../models/organisationModel');
const { createInvoicePdf, loadLogo } = require('../utils/pdfUtils');
const clientBalanceService = require('./clientBalanceService');
const path = require('path');
const fs = require('fs');

const invoiceService = {
  async generateInvoices(year, month, clientId) {
    try {

      console.log(`Generating invoice for clientId: ${clientId}, year: ${year}, month: ${month}`);
      if (!clientId || isNaN(clientId) || parseInt(clientId) <= 0) {
        console.error(`Invalid clientId: ${clientId}`);
        throw new Error('Invalid client ID: Must be a positive integer');
      }
      const client = await Client.findOne({
        where: {
          id: parseInt(clientId),
          deletedAt: null,
        },
        attributes: ['id', 'ClientName', 'RegisteredAddress', 'BillingCurrencyID', 'BankDetailID', 'OrganisationID'],
        include: [
          { model: Currency, as: 'BillingCurrency', attributes: ['id', 'CurrencyName', 'CurrencyCode'] },
          { model: BankDetail, as: 'BankDetail', attributes: ['id', 'BankName', 'AccountNumber', 'SwiftCode', 'IFSC'] },
          { model: Organisation, as: 'Organisation', attributes: ['id', 'Abbreviation'] },
        ],
      });

      if (!client) {
        console.error(`Client not found: clientId=${clientId}`);
        throw new Error('Client not found');
      }
      console.log(`Client data:`, {
        id: client.id,
        ClientName: client.ClientName,
        RegisteredAddress: client.RegisteredAddress,
        BillingCurrencyID: client.BillingCurrencyID,
        BankDetailID: client.BankDetailID,
        OrganisationID: client.OrganisationID,
      });

      if (!client.ClientName) {
        console.warn(`ClientName is empty for clientId=${clientId}`);
        throw new Error('Client name is missing');
      }

      const monthName = getMonthNameFromNumber(month);
      if (!monthName) {
        throw new Error(`Invalid month number: ${month}`);
      }

      const billingYear = month >= 1 && month <= 3 ? parseInt(year) + 1 : parseInt(year);
      const clientBalance = await clientBalanceService.getClientBalance(clientId);
      const previousBalance = clientBalance.balances.find(balance => 
        balance.currencyId === client.BillingCurrencyID
      )?.balance || 0;
      
      console.log(`Previous balance for client ${clientId}: ${previousBalance}`); // Add this for debugging
      
      // Calculate total billing amount and fetch employee details
      const { total: billingTotal, employeeDetails } = await calculateTotalBillingAmount(clientId, billingYear, monthName);
      console.log(`Calculated total billing amount: ${billingTotal}`);
      console.log(`Total due (previous + current): ${previousBalance + billingTotal}`); // Add this for debugging
  
      const invoice = await Invoice.create({
        ClientID: client.id,
        BillingCurrencyID: client.BillingCurrencyID,
        Year: year,
        Month: month,
        TotalAmount: billingTotal,
        OrganisationID: client.OrganisationID,
        BankDetailID: client.BankDetailID,
        Status: 'Generated',
        GeneratedOn: new Date(),
      });
      console.log(`Invoice created: invoiceId=${invoice.id}`);

      const invoiceDir = path.join(__dirname, '../invoices');
      if (!fs.existsSync(invoiceDir)) {
        console.log(`Creating invoices directory: ${invoiceDir}`);
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const invoiceFilePath = path.join(invoiceDir, `${invoice.id}.pdf`);
      console.log(`Generating PDF at: ${invoiceFilePath}`);

      try {
        await createInvoicePdf(
          {
            clientId: client.id,
            year,
            month,
            totalAmount: billingTotal,
            previousBalance: previousBalance, // Add this line
            logoBase64: loadLogo(),
            clientName: client.ClientName,
            clientAddress: client.RegisteredAddress || 'N/A',
            bankDetails: client.BankDetail
              ? {
                  bankName: client.BankDetail.BankName || 'N/A',
                  accountNo: client.BankDetail.AccountNumber || 'N/A',
                  swiftCode: client.BankDetail.SwiftCode || 'N/A',
                  ifscCode: client.BankDetail.IFSC || 'N/A',
                  payeeName: client.Organisation?.Abbreviation || 'N/A',
                }
              : {
                  bankName: 'N/A',
                  accountNo: 'N/A',
                  swiftCode: 'N/A',
                  ifscCode: 'N/A',
                  payeeName: 'N/A',
                },
            currencyCode: client.BillingCurrency?.CurrencyCode || 'INR',
          },
          employeeDetails,
          invoiceFilePath
        );

        console.log(`PDF generated successfully for invoiceId=${invoice.id}`);
      } catch (pdfError) {
        console.error(`PDF generation failed for invoiceId=${invoice.id}:`, pdfError);
        throw new Error(`Failed to generate PDF: ${pdfError.message}`);
      }

      await invoice.update({ PdfPath: `${invoice.id}.pdf` });
      console.log(`Invoice updated with PdfPath: ${invoice.id}.pdf`);

      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error(`Error generating invoice: ${error.message}`);
    }
  },

  async regenerateInvoice(id) {
    try {
      console.log(`Regenerating invoice: invoiceId=${id}`);
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Client,
            attributes: ['id', 'ClientName', 'Abbreviation', 'RegisteredAddress'],
            include: [
              { model: Currency, as: 'BillingCurrency', attributes: ['id', 'CurrencyName', 'CurrencyCode'] },
              { model: BankDetail, as: 'BankDetail', attributes: ['id', 'BankName', 'AccountNumber', 'SwiftCode', 'IFSC'] },
              { model: Organisation, as: 'Organisation', attributes: ['id', 'Abbreviation'] },
            ],
          },
        ],
      });
      if (!invoice) {
        console.error(`Invoice not found: invoiceId=${id}`);
        throw new Error('Invoice not found');
      }

      if (!invoice.Client.ClientName) {
        console.warn(`ClientName is empty for invoiceId=${id}, clientId=${invoice.ClientID}`);
        throw new Error('Client name is missing');
      }

      // Recalculate total amount and fetch employee details
      const monthName = getMonthNameFromNumber(invoice.Month);
      const billingYear = invoice.Month >= 1 && invoice.Month <= 3 ? parseInt(invoice.Year) + 1 : parseInt(invoice.Year);
      const { total: billingTotal, employeeDetails } = await calculateTotalBillingAmount(invoice.ClientID, billingYear, monthName);

      // Update the invoice with new total if different
      if (billingTotal !== invoice.TotalAmount) {
        await invoice.update({ TotalAmount: billingTotal });
      }

      // Ensure the invoices directory exists
      const invoiceDir = path.join(__dirname, '../invoices');
      if (!fs.existsSync(invoiceDir)) {
        console.log(`Creating invoices directory: ${invoiceDir}`);
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      // Define the PDF file path
      const invoiceFilePath = path.join(invoiceDir, `${invoice.id}.pdf`);
      console.log(`Regenerating PDF at: ${invoiceFilePath}`);

      // Delete existing PDF if it exists
      if (fs.existsSync(invoiceFilePath)) {
        console.log(`Deleting existing PDF: ${invoiceFilePath}`);
        fs.unlinkSync(invoiceFilePath);
      }

      // Generate the new PDF
      try {
        await createInvoicePdf(
          {
            clientId: invoice.ClientID,
            year: invoice.Year,
            month: invoice.Month,
            totalAmount: billingTotal,
            logoBase64: loadLogo(),
            clientName: invoice.Client.ClientName,
            clientAddress: invoice.Client.RegisteredAddress || 'N/A',
            bankDetails: invoice.Client.BankDetail
              ? {
                  bankName: invoice.Client.BankDetail.BankName || 'N/A',
                  accountNo: invoice.Client.BankDetail.AccountNumber || 'N/A',
                  swiftCode: invoice.Client.BankDetail.SwiftCode || 'N/A',
                  ifscCode: invoice.Client.BankDetail.IFSC || 'N/A',
                  payeeName: invoice.Client.Organisation?.Abbreviation || 'N/A',
                }
              : {
                  bankName: 'N/A',
                  accountNo: 'N/A',
                  swiftCode: 'N/A',
                  ifscCode: 'N/A',
                  payeeName: 'N/A',
                },
            currencyCode: invoice.Client.BillingCurrency?.CurrencyCode || 'INR',
          },
          employeeDetails,
          invoiceFilePath
        );
        console.log(`PDF regenerated successfully for invoiceId=${invoice.id}`);
      } catch (pdfError) {
        console.error(`Failed to generate PDF for invoiceId=${invoice.id}:`, pdfError);
        throw new Error(`Failed to generate PDF: ${pdfError.message}`);
      }

      // Update the PdfPath in the database
      await invoice.update({ PdfPath: `${invoice.id}.pdf` });
      console.log(`Updated PdfPath for invoiceId=${invoice.id}`);

      return invoice;
    } catch (error) {
      console.error('Error regenerating invoice:', error);
      throw new Error(`Error regenerating invoice: ${error.message}`);
    }
  },

  async getGeneratedInvoices(year, month) {
    try {
      const invoices = await Invoice.findAll({
        where: {
          Year: year,
          Month: month,
          Status: {
            [Op.in]: ['Generated', 'Sent to Client'],
          },
        },
        include: [
          {
            model: Client,
            attributes: ['id', 'ClientName'],
          },
          {
            model: Currency,
            as: 'BillingCurrency',
            attributes: ['id', 'CurrencyCode'],
          },
        ],
      });
      return invoices;
    } catch (error) {
      console.error('Error fetching generated invoices:', error);
      throw new Error(`Error fetching generated invoices: ${error.message}`);
    }
  },

  async getInvoiceById(id) {
    try {
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Client,
            attributes: ['id', 'ClientName'],
          },
          {
            model: Currency,
            as: 'BillingCurrency',
            attributes: ['id', 'CurrencyCode'],
          },
        ],
      });
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      return invoice;
    } catch (error) {
      console.error('Error fetching invoice by ID:', error);
      throw new Error(`Error fetching invoice: ${error.message}`);
    }
  },

  async deleteInvoice(id) {
    try {
      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      await invoice.destroy();
      const invoicePath = path.join(__dirname, '../invoices', `${id}.pdf`);
      if (fs.existsSync(invoicePath)) {
        fs.unlinkSync(invoicePath);
        console.log(`Deleted invoice PDF: ${invoicePath}`);
      }
      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw new Error(`Error deleting invoice: ${error.message}`);
    }
  },

  async markInvoiceAsSent(id) {
    try {
      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      await invoice.update({ Status: 'Sent to Client' });
      return invoice;
    } catch (error) {
      console.error('Error marking invoice as sent:', error);
      throw new Error(`Error marking invoice as sent: ${error.message}`);
    }
  },
};

// Helper function to calculate total billing amount and fetch employee details
async function calculateTotalBillingAmount(clientId, year, monthName) {
  try {
    console.log(`Calculating total for clientId=${clientId}, year=${year}, month=${monthName}`);

    // Find all billing details for this client and year
    const billingDetails = await BillingDetail.findAll({
      where: {
        ClientID: clientId,
        Year: year,
      },
      include: [
        {
          model: Employee,
          attributes: ['id', 'FirstName', 'LastName'],
        },
      ],
    });

    if (!billingDetails || billingDetails.length === 0) {
      console.warn(`No billing details found for clientId=${clientId}, year=${year}`);
      return { total: 0, employeeDetails: [] };
    }

    // Sum up the amounts and prepare employee details
    const employeeDetails = [];
    const total = billingDetails.reduce((sum, detail) => {
      const monthValue = detail[monthName] || 0;
      const amount = parseFloat(monthValue);
      if (amount > 0) { // Only include employees with non-zero billing
        employeeDetails.push({
          name: `${detail.Employee?.FirstName || ''} ${detail.Employee?.LastName || ''}`.trim() || 'Unknown',
          amount: amount.toFixed(2),
        });
      }
      return sum + amount;
    }, 0);

    console.log(`Total calculated: ${total} for month ${monthName}`);
    return { total, employeeDetails };
  } catch (error) {
    console.error('Error calculating total billing amount:', error);
    throw new Error(`Error calculating billing total: ${error.message}`);
  }
}

// Helper function to convert month number to name
function getMonthNameFromNumber(monthNumber) {
  const fiscalMonthMap = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  };
  return fiscalMonthMap[monthNumber];
}

module.exports = invoiceService;