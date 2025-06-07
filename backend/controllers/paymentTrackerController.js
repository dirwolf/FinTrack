const paymentTrackerService = require('../services/paymentTrackerService');
const logger = require('../utils/logger');

// Create a new payment
const createPayment = async (req, res) => {
  const { ClientID, ReceivedDate, Amount, Remark } = req.body;
  try {
    const payment = await paymentTrackerService.createPayment(ClientID, ReceivedDate, Amount, Remark);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get last 3 payments by client ID
const getLastThreePayments = async (req, res) => {
  const { clientId } = req.params;
  try {
    const payments = await paymentTrackerService.getLastThreePaymentsByClient(parseInt(clientId));
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching last three payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get reconciliation note
const getReconciliationNote = async (req, res) => {
  try {
    const note = await paymentTrackerService.getReconciliationNote();
    res.status(200).json(note);
  } catch (error) {
    console.error('Error fetching reconciliation note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update or create reconciliation note
const updateReconciliationNote = async (req, res) => {
  const { noteContent } = req.body;
  try {
    const updatedNote = await paymentTrackerService.createOrUpdateReconciliationNote(noteContent);
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Error updating reconciliation note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPayment,
  getLastThreePayments,
  getReconciliationNote,
  updateReconciliationNote,
};
