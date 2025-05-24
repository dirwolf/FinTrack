const bankDetailService = require('../services/bankDetailService');
const logger = require('../utils/logger');

const bankDetailController = {
  async getAllBankDetails(req, res) {
    try {
      const bankDetails = await bankDetailService.getAllBankDetails();
      res.json(bankDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBankDetailById(req, res) {
    try {
      const bankDetail = await bankDetailService.getBankDetailById(req.params.bankDetailId);
      res.json(bankDetail);
    } catch (error) {
      if (error.message === 'Bank detail not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createBankDetail(req, res) {
    try {
      const bankDetail = await bankDetailService.createBankDetail(req.body);
      res.status(201).json(bankDetail);
    } catch (error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async updateBankDetail(req, res) {
    try {
      const bankDetail = await bankDetailService.updateBankDetail(req.params.bankDetailId, req.body);
      res.json(bankDetail);
    } catch (error) {
      if (error.message === 'Bank detail not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteBankDetail(req, res) {
    try {
      const result = await bankDetailService.deleteBankDetail(req.params.bankDetailId);
      res.json(result);
    } catch (error) {
      if (error.message === 'Bank detail not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('active clients')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchBankDetails(req, res) {
    try {
      const bankDetails = await bankDetailService.searchBankDetails(req.query.q);
      res.json(bankDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBankDetailClients(req, res) {
    try {
      const clients = await bankDetailService.getBankDetailClients(req.params.bankDetailId);
      res.json(clients);
    } catch (error) {
      if (error.message === 'Bank detail not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
};

module.exports = bankDetailController;
