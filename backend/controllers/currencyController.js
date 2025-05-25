const currencyService = require('../services/currencyService');

const currencyController = {
  async getAllCurrencies(req, res) {
    try {
      const currencies = await currencyService.getAllCurrencies();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCurrencyById(req, res) {
    try {
      const currency = await currencyService.getCurrencyById(req.params.id);
      res.json(currency);
    } catch (error) {
      if (error.message === 'Currency not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createCurrency(req, res) {
    try {
      const currency = await currencyService.createCurrency(req.body);
      res.status(201).json(currency);
    } catch (error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async updateCurrency(req, res) {
    try {
      const currency = await currencyService.updateCurrency(req.params.id, req.body);
      res.json(currency);
    } catch (error) {
      if (error.message === 'Currency not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteCurrency(req, res) {
    try {
      const result = await currencyService.deleteCurrency(req.params.id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Currency not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('active clients')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchCurrencies(req, res) {
    try {
      const currencies = await currencyService.searchCurrencies(req.query.q);
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCurrencyClients(req, res) {
    try {
      const clients = await currencyService.getCurrencyClients(req.params.id);
      res.json(clients);
    } catch (error) {
      if (error.message === 'Currency not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
};

module.exports = currencyController;
