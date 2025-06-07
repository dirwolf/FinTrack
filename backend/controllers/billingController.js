// controllers/billingController.js
const billingService = require('../services/billingService');
const logger = require('../utils/logger');

const billingController = {
  async getClientsForYear(req, res) {
    try {
      const { year } = req.params;
      const clients = await billingService.getClientsForYear(year);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBillingData(req, res) {
    try {
      const { clientId, year } = req.params;
      const billingData = await billingService.getBillingData(clientId, year);
      res.json(billingData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateBillingData(req, res) {
    try {
      const { id } = req.params;
      const { month, amount } = req.body;
      const billingData = await billingService.updateBillingData(id, month, amount);
      res.json(billingData);
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
};

module.exports = billingController;
