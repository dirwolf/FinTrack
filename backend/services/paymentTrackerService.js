const { Op } = require('sequelize');
const PaymentTracker = require('../models/paymentTrackerModel');
const Client = require('../models/clientModel');
const Currency = require('../models/currencyModel');
const sequelize = require('../db/sequelize');
const Ledger = require('../models/ledgerModel');
const ReconciliationNote = require('../models/reconciliationModel');

// Helper: Recalculate the balance for a client
const recalculateBalanceFromStart = async (ClientID, transaction) => {
  const ledgerEntries = await Ledger.findAll({
    where: { ClientID },
    order: [['Date', 'ASC']],
    transaction,
  });

  const paymentEntries = await PaymentTracker.findAll({
    where: { ClientID },
    order: [['ReceivedDate', 'ASC']],
    transaction,
  });

  const combinedEntries = [
    ...ledgerEntries.map(entry => ({
      type: 'Invoice',
      date: entry.Date,
      amount: entry.Amount,
    })),
    ...paymentEntries.map(entry => ({
      type: 'Payment',
      date: entry.ReceivedDate,
      amount: entry.Amount,
    })),
  ];

  combinedEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

  let balance = 0;
  for (const entry of combinedEntries) {
    if (entry.type === 'Invoice') {
      balance += parseFloat(entry.amount);
    } else if (entry.type === 'Payment') {
      balance -= parseFloat(entry.amount);
    }

    if (entry.type === 'Invoice') {
      await Ledger.update(
        { Balance: balance },
        {
          where: {
            ClientID,
            Date: entry.date,
          },
          transaction,
        }
      );
    }
  }
};

// Create a new payment entry
const createPayment = async (ClientID, ReceivedDate, Amount, Remark) => {
  const transaction = await sequelize.transaction();
  try {
    const payment = await PaymentTracker.create(
      {
        ClientID,
        ReceivedDate,
        Amount,
        Remark,
      },
      { transaction }
    );

    await Client.update(
      { paymentLastUpdated: new Date() },
      { where: { id: ClientID }, transaction }
    );

    await recalculateBalanceFromStart(ClientID, transaction);

    await transaction.commit();
    return payment.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw new Error(`Error creating payment: ${error.message}`);
  }
};

// Fetch last 3 payments for a client
const getLastThreePaymentsByClient = async (ClientID) => {
  const payments = await PaymentTracker.findAll({
    where: { ClientID },
    include: [
      {
        model: Client,
        attributes: ['ClientName', 'paymentLastUpdated'],
        include: [
          {
            model: Currency,
            as: 'BillingCurrency',
            attributes: ['CurrencyCode'],
          },
        ],
      },
    ],
    order: [['ReceivedDate', 'DESC'], ['createdAt', 'DESC']],
    // limit: 3,
  });

  const currency = payments.length > 0 ? payments[0].Client.BillingCurrency : null;

  return {
    paymentLastUpdated: payments.length > 0 ? payments[0].Client.paymentLastUpdated : null,
    currency: currency ? currency.CurrencyCode : null,
    payments: payments.map(p => p.toJSON()),
  };
};

// Get the latest reconciliation note
const getReconciliationNote = async () => {
  const note = await ReconciliationNote.findOne({
    order: [['createdAt', 'DESC']],
  });

  return note ? note.toJSON() : null;
};

// Create or update reconciliation note
const createOrUpdateReconciliationNote = async (noteContent) => {
  const existingNote = await ReconciliationNote.findOne();

  if (existingNote) {
    existingNote.note = noteContent;
    await existingNote.save();
    return existingNote.toJSON();
  } else {
    const newNote = await ReconciliationNote.create({ note: noteContent });
    return newNote.toJSON();
  }
};

module.exports = {
  createPayment,
  getLastThreePaymentsByClient,
  getReconciliationNote,
  createOrUpdateReconciliationNote,
};
