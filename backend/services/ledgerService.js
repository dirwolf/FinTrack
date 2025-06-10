const Ledger = require('../models/ledgerModel');
const Invoice = require('../models/invoiceModel');
const PaymentTracker = require('../models/paymentTrackerModel');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const getLedgerEntriesByClientAndDateRange = async (clientId, startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    console.log("Ledger Query Parameters:", {
      clientId,
      startDate,
      endDate,
      startObj: start,
      endObj: end
    });

    // Check ALL invoices in the system regardless of client or date
    const allInvoices = await Invoice.findAll();
    console.log(`Total invoices in the system: ${allInvoices.length}`);
    if (allInvoices.length > 0) {
      console.log("Sample invoice:", allInvoices[0].dataValues);
    }

    // Check invoices for this client regardless of date
    const clientInvoices = await Invoice.findAll({
      where: {
        ClientID: clientId
      }
    });
    console.log(`Total invoices for client ${clientId}: ${clientInvoices.length}`);
    if (clientInvoices.length > 0) {
      console.log("Sample client invoice:", clientInvoices[0].dataValues);
    }

    // Now check with date filter using GeneratedOn instead of InvoiceDate
    const invoiceEntries = await Invoice.findAll({
      where: {
        ClientID: clientId,
        GeneratedOn: { // Changed from InvoiceDate to GeneratedOn
          [Op.gte]: start,
          [Op.lte]: end 
        },
      },
      order: [['GeneratedOn', 'ASC']], // Changed from InvoiceDate to GeneratedOn
    });
    
    console.log(`Invoice entries within date range: ${invoiceEntries.length}`);
    if (invoiceEntries.length > 0) {
      console.log("Sample date-filtered invoice:", invoiceEntries[0].dataValues);
    }

    const paymentEntries = await PaymentTracker.findAll({
      where: {
        ClientID: clientId,
        ReceivedDate: { 
          [Op.gte]: start,
          [Op.lte]: end 
        },
      },
      order: [['ReceivedDate', 'ASC']],
    });
    
    console.log(`Payment entries within date range: ${paymentEntries.length}`);

    const combinedEntries = [
      ...invoiceEntries.map(entry => ({
        id: entry.id,
        Date: entry.GeneratedOn, // Changed from InvoiceDate to GeneratedOn
        type: 'Invoice',
        InvoiceRaised: entry.TotalAmount, // Changed from Amount to TotalAmount based on your model
        PaymentReceived: null,
      })),
      ...paymentEntries.map(entry => ({
        id: entry.id,
        Date: entry.ReceivedDate,
        type: 'Payment',
        InvoiceRaised: null,
        PaymentReceived: entry.Amount,
      })),
    ];

    combinedEntries.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    let balance = 0;
    const entriesWithBalance = combinedEntries.map(entry => {
      if (entry.type === 'Invoice') {
        balance += parseFloat(entry.InvoiceRaised);
      } else if (entry.type === 'Payment') {
        balance -= parseFloat(entry.PaymentReceived);
      }
      return { ...entry, BalancePayment: balance };
    });

    return {
      entries: entriesWithBalance,
      balance,
    };
  } catch (error) {
    logger.error(`Error fetching ledger entries: ${error.message}`);
    console.error("Full error:", error);
    throw new Error(`Error fetching ledger entries: ${error.message}`);
  }
};

module.exports = { getLedgerEntriesByClientAndDateRange };
