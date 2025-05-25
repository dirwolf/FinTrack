const currencyExchangeRateService = require('../services/currencyExchangeRateService');
const logger = require('../utils/logger');

const currencyExchangeRateController = {
  async getAllExchangeRates(req, res) {
    try {
      const rates = await currencyExchangeRateService.getAllExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getExchangeRateById(req, res) {
    try {
      const rate = await currencyExchangeRateService.getExchangeRateById(req.params.id);
      res.json(rate);
    } catch (error) {
      if (error.message === 'Exchange rate not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createExchangeRate(req, res) {
    try {
      const rate = await currencyExchangeRateService.createExchangeRate(req.body);
      res.status(201).json(rate);
    } catch (error) {
      if (error.message === 'One or both currencies not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Exchange rate already exists for this currency pair and period') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async updateExchangeRate(req, res) {
    try {
      const rate = await currencyExchangeRateService.updateExchangeRate(req.params.id, req.body);
      res.json(rate);
    } catch (error) {
      if (error.message === 'Exchange rate not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'One or both currencies not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Exchange rate already exists for this currency pair and period') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteExchangeRate(req, res) {
    try {
      const result = await currencyExchangeRateService.deleteExchangeRate(req.params.id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Exchange rate not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchExchangeRates(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const rates = await currencyExchangeRateService.searchExchangeRates(query);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getExchangeRateByCurrencies(req, res) {
    try {
      const { fromCurrencyId, toCurrencyId, year, month } = req.query;
      if (!fromCurrencyId || !toCurrencyId || !year || !month) {
        return res.status(400).json({ error: 'All parameters (fromCurrencyId, toCurrencyId, year, month) are required' });
      }
      const rate = await currencyExchangeRateService.getExchangeRateByCurrencies(fromCurrencyId, toCurrencyId, year, month);
      res.json(rate);
    } catch (error) {
      if (error.message === 'Exchange rate not found for the specified currencies and period') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
};

module.exports = currencyExchangeRateController;
