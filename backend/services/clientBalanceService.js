const { Op } = require('sequelize');
const sequelize = require('../db/connectDB').sequelize;
const Client = require('../models/clientModel');
const Invoice = require('../models/invoiceModel');
const PaymentTracker = require('../models/paymentTrackerModel');
const Currency = require('../models/currencyModel');

const clientBalanceService = {
  // Add this function to the clientBalanceService object
  async getClientBalanceReport() {
    const transaction = await sequelize.transaction();
    try {
      console.log("Starting getClientBalanceReport...");
      
      // Get all clients with their balance information
      const clients = await Client.findAll({
        attributes: ['id', 'ClientName'],
        transaction
      });
      
      console.log(`Found ${clients.length} clients in the database`);
      if (clients.length > 0) {
        console.log("Sample client:", clients[0].dataValues);
      }

      const report = await Promise.all(clients.map(async (client) => {
        console.log(`Processing client: ${client.ClientName} (ID: ${client.id})`);
        
        // First check if any invoices exist for this client
        const invoiceCount = await Invoice.count({
          where: { ClientID: client.id },
          transaction
        });

        console.log(`Found ${invoiceCount} invoices for client ${client.id}`);

        // Get a sample invoice to see its structure
        if (invoiceCount > 0) {
          const sampleInvoice = await Invoice.findOne({
            where: { ClientID: client.id },
            transaction
          });
          console.log(`Sample invoice for client ${client.id}:`, sampleInvoice.dataValues);
          console.log(`TotalAmount type:`, typeof sampleInvoice.TotalAmount);
          console.log(`TotalAmount value:`, sampleInvoice.TotalAmount);
        }
        
        // Get all invoices for the client
        const allInvoices = await Invoice.findAll({
          where: { ClientID: client.id },
          attributes: ['TotalAmount', 'Status', 'GeneratedOn'],
          raw: true,
          transaction
        });

        console.log(`Raw invoice data for client ${client.id}:`, allInvoices);

        // Calculate the total manually
        const manualTotalBill = allInvoices.reduce((sum, invoice) => {
          const amount = parseFloat(invoice.TotalAmount) || 0;
          return sum + amount;
        }, 0);

        console.log(`Manually calculated total bill for client ${client.id}: ${manualTotalBill}`);
        
        // Get total invoiced amount for each client using original method
        const invoiceTotal = await Invoice.findOne({
          where: { ClientID: client.id },
          attributes: [
            [sequelize.fn('SUM', sequelize.col('TotalAmount')), 'totalBill']
          ],
          raw: true,
          transaction
        });
        
        console.log(`Invoice total for client ${client.id} (SQL method):`, invoiceTotal);

        // Try with different status filters
        const invoiceTotalWithStatus = await Invoice.findOne({
          where: { 
            ClientID: client.id,
            Status: { [Op.in]: ['Generated', 'Sent', 'Approved'] }
          },
          attributes: [
            [sequelize.fn('SUM', sequelize.col('TotalAmount')), 'totalBill']
          ],
          raw: true,
          transaction
        });
        
        console.log(`Invoice total with status filter for client ${client.id}:`, invoiceTotalWithStatus);

        // Get total paid amount for each client
        const paymentTotal = await PaymentTracker.findOne({
          where: { ClientID: client.id },
          attributes: [
            [sequelize.fn('SUM', sequelize.col('Amount')), 'totalPaid']
          ],
          raw: true,
          transaction
        });
        
        console.log(`Payment total for client ${client.id}:`, paymentTotal);

        // Use the manually calculated total if SQL method returns null or 0
        const totalBill = (invoiceTotal?.totalBill || 0) > 0 ? 
                          invoiceTotal.totalBill : manualTotalBill;
        const totalPaid = paymentTotal?.totalPaid || 0;
        const balance = totalBill - totalPaid;
        
        console.log(`Calculated balance for client ${client.id}: ${balance} (Bill: ${totalBill}, Paid: ${totalPaid})`);

        return {
          clientId: client.id,
          clientName: client.ClientName,
          totalBill,
          totalPaid,
          balance
        };
      }));
      
      console.log(`Generated report with ${report.length} entries`);
      console.log("Final report:", JSON.stringify(report, null, 2));

      await transaction.commit();
      return report;
    } catch (error) {
      await transaction.rollback();
      console.error('Error generating client balance report:', error);
      throw new Error('Failed to generate client balance report');
    }
  },

  async getClientBalanceHistory(clientId, startDate, endDate) {
    const transaction = await sequelize.transaction();
    try {
      console.log(`Getting balance history for client ${clientId} from ${startDate} to ${endDate}`);
      
      const client = await Client.findByPk(clientId, {
        include: [
          {
            model: Currency,
            attributes: ['CurrencyName', 'CurrencyCode']
          }
        ],
        transaction
      });

      if (!client) {
        throw new Error('Client not found');
      }
      
      console.log(`Found client: ${client.ClientName}`);

      // Get all invoices within date range - CHANGED InvoiceDate to GeneratedOn
      const invoices = await Invoice.findAll({
        where: {
          ClientID: clientId,
          GeneratedOn: { // Changed from InvoiceDate to GeneratedOn
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          'GeneratedOn', // Changed from InvoiceDate to GeneratedOn
          'CurrencyID',
          'TotalAmount'
        ],
        order: [['GeneratedOn', 'ASC']], // Changed from InvoiceDate to GeneratedOn
        transaction
      });
      
      console.log(`Found ${invoices.length} invoices in date range`);
      if (invoices.length > 0) {
        console.log("Sample invoice:", invoices[0].dataValues);
      }

      // Get all payments within date range
      const payments = await PaymentTracker.findAll({
        where: {
          ClientID: clientId,
          ReceivedDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          'ReceivedDate',
          'CurrencyID',
          'Amount'
        ],
        order: [['ReceivedDate', 'ASC']],
        transaction
      });
      
      console.log(`Found ${payments.length} payments in date range`);
      if (payments.length > 0) {
        console.log("Sample payment:", payments[0].dataValues);
      }

      // Combine and sort transactions
      const transactions = [
        ...invoices.map(inv => ({
          date: inv.GeneratedOn, // Changed from InvoiceDate to GeneratedOn
          type: 'invoice',
          currencyId: inv.CurrencyID,
          amount: parseFloat(inv.TotalAmount)
        })),
        ...payments.map(pay => ({
          date: pay.ReceivedDate,
          type: 'payment',
          currencyId: pay.CurrencyID,
          amount: -parseFloat(pay.Amount)
        }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log(`Combined ${transactions.length} transactions`);

      // Calculate running balance
      const balances = {};
      const history = [];

      for (const transaction of transactions) {
        const { date, type, currencyId, amount } = transaction;
        
        if (!balances[currencyId]) {
          balances[currencyId] = 0;
        }
        balances[currencyId] += amount;

        history.push({
          date,
          type,
          currencyId,
          amount,
          balance: balances[currencyId]
        });
      }
      
      console.log(`Generated history with ${history.length} entries`);

      await transaction.commit();
      return {
        clientId: client.id,
        clientName: client.ClientName,
        history
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error calculating client balance history:', error);
      throw new Error('Error calculating client balance history: ' + error.message);
    }
  },

  async getClientBalance(clientId) {
    const transaction = await sequelize.transaction();
    try {
      console.log(`Getting balance for client ${clientId}`);
      
      const client = await Client.findByPk(clientId, {
        include: [
          {
            model: Currency,
            as: 'BillingCurrency',
            attributes: ['CurrencyName', 'CurrencyCode']
          }
        ],
        transaction
      });
  
      if (!client) {
        throw new Error('Client not found');
      }
      
      console.log(`Found client: ${client.ClientName}`);
  
      // First check if any invoices exist for this client
      const invoiceCount = await Invoice.count({
        where: { ClientID: clientId },
        transaction
      });

      console.log(`Found ${invoiceCount} invoices for client ${clientId}`);

      // Get all invoices for the client
      const allInvoices = await Invoice.findAll({
        where: { ClientID: clientId },
        attributes: ['TotalAmount'],
        raw: true,
        transaction
      });

      console.log(`Raw invoice data for client ${clientId}:`, allInvoices);

      // Calculate the total manually
      const manualTotalBill = allInvoices.reduce((sum, invoice) => {
        const amount = parseFloat(invoice.TotalAmount) || 0;
        return sum + amount;
      }, 0);

      console.log(`Manually calculated total bill for client ${clientId}: ${manualTotalBill}`);
      
      // Get total invoiced amount for each client using original method
      const invoiceTotal = await Invoice.findOne({
        where: { ClientID: clientId },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('TotalAmount')), 'totalBill']
        ],
        raw: true,
        transaction
      });
      
      console.log(`Invoice total for client ${clientId} (SQL method):`, invoiceTotal);
  
      // Get all payments for the client
      const paymentTotal = await PaymentTracker.findOne({
        where: { ClientID: client.id },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('Amount')), 'totalPaid']
        ],
        raw: true,
        transaction
      });
      
      console.log(`Payment total for client ${clientId}:`, paymentTotal);
  
      // Use the manually calculated total if SQL method returns null or 0
      const totalBill = (invoiceTotal?.totalBill || 0) > 0 ? 
                        invoiceTotal.totalBill : manualTotalBill;
      const totalPaid = paymentTotal?.totalPaid || 0;
      const balance = totalBill - totalPaid; // This matches the overview page calculation
      
      console.log(`Calculated balance for client ${clientId}: ${balance} (Bill: ${totalBill}, Paid: ${totalPaid})`);
  
      // Format the response
      const formattedBalances = [{
        currencyId: client.BillingCurrencyID,
        currencyName: client.BillingCurrency.CurrencyName,
        currencyCode: client.BillingCurrency.CurrencyCode,
        balance: balance
      }];
      
      console.log(`Formatted balances:`, formattedBalances);
      
      await transaction.commit();
      return {
        clientId: client.id,
        clientName: client.ClientName,
        balances: formattedBalances
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error calculating client balance:', error);
      throw new Error('Error calculating client balance: ' + error.message);
    }
  },

  async getClientBalanceSummary() {
    const transaction = await sequelize.transaction();
    try {
      console.log("Starting getClientBalanceSummary...");
      
      const clients = await Client.findAll({
        include: [
          {
            model: Currency,
            attributes: ['CurrencyName', 'CurrencyCode']
          }
        ],
        transaction
      });
      
      console.log(`Found ${clients.length} clients in the database`);

      const summary = await Promise.all(clients.map(async client => {
        console.log(`Processing client: ${client.ClientName} (ID: ${client.id})`);
        const balance = await this.getClientBalance(client.id);
        return balance;
      }));
      
      console.log(`Generated summary with ${summary.length} entries`);
      console.log("Final summary:", JSON.stringify(summary, null, 2));

      await transaction.commit();
      return summary;
    } catch (error) {
      await transaction.rollback();
      console.error('Error calculating client balance summary:', error);
      throw new Error('Error calculating client balance summary: ' + error.message);
    }
  }
};

module.exports = clientBalanceService;
