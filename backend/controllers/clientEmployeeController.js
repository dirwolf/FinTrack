// clientEmployeeController.js
const clientEmployeeService = require('../services/clientEmployeeService');
const logger = require('../utils/logger');

const clientEmployeeController = {
  async getAllClientEmployees(req, res) {
    try {
      const clientEmployees = await clientEmployeeService.getAllClientEmployees();
      res.json(clientEmployees);
    } catch (error) {
      logger.error(`Error fetching client employees: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },

  async getClientEmployeeById(req, res) {
    try {
      const clientEmployee = await clientEmployeeService.getClientEmployeeById(req.params.id);
      res.json(clientEmployee);
    } catch (error) {
      if (error.message === 'Client employee not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error(`Error fetching client employee: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createClientEmployee(req, res) {
    try {
      const clientEmployee = await clientEmployeeService.createClientEmployee(req.body);
      res.status(201).json(clientEmployee);
    } catch (error) {
      logger.error(`Error creating client employee: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  },

  async updateClientEmployee(req, res) {
    try {
      const clientEmployee = await clientEmployeeService.updateClientEmployee(req.params.id, req.body);
      res.json(clientEmployee);
    } catch (error) {
      if (error.message === 'Client employee not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error(`Error updating client employee: ${error.message}`);
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteClientEmployee(req, res) {
    try {
      const result = await clientEmployeeService.deleteClientEmployee(req.params.id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Client employee not found') {
        res.status(404).json({ error: error.message });
      } else {
        logger.error(`Error deleting client employee: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchClientEmployees(req, res) {
    try {
      const clientEmployees = await clientEmployeeService.searchClientEmployees(req.query.q);
      res.json(clientEmployees);
    } catch (error) {
      logger.error(`Error searching client employees: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },

  async getClientEmployeesByClient(req, res) {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      if (isNaN(clientId)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      const clientEmployees = await clientEmployeeService.getClientEmployeesByClient(clientId);
      // Return empty array with 200 status if no resources are found
      res.json(clientEmployees || []);
    } catch (error) {
      logger.error(`Error fetching client employees for client ${req.params.clientId}: ${error.message}`);
      res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
    }
  },

  async getClientEmployeesByEmployee(req, res) {
    try {
      const clientEmployees = await clientEmployeeService.getClientEmployeesByEmployee(req.params.employeeId);
      res.json(clientEmployees);
    } catch (error) {
      logger.error(`Error fetching client employees: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },

  async getClientEmployeesByStatus(req, res) {
    try {
      const { status } = req.params;
      const clientEmployees = await clientEmployeeService.getClientEmployeesByStatus(status);
      res.json(clientEmployees);
    } catch (error) {
      logger.error(`Error fetching client employees by status: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },

  async getClientEmployeeSummary(req, res) {
    try {
      const summary = await clientEmployeeService.getClientEmployeeSummary();
      res.json(summary);
    } catch (error) {
      logger.error(`Error fetching client employee summary: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = clientEmployeeController;