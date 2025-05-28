const clientService = require('../services/clientService');

const clientController = {
  async getAllClients(req, res) {
    try {
      const clients = await clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error('Error in getAllClients controller:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getClientById(req, res) {
    try {
      const client = await clientService.getClientById(req.params.id);
      res.json(client);
    } catch (error) {
      console.error('Error in getClientById controller:', error);
      if (error.message === 'Client not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createClient(req, res) {
    try {
      const client = await clientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      console.error('Error in createClient controller:', error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateClient(req, res) {
    try {
      const client = await clientService.updateClient(req.params.id, req.body);
      res.json(client);
    } catch (error) {
      console.error('Error in updateClient controller:', error);
      if (error.message === 'Client not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteClient(req, res) {
    try {
      const result = await clientService.deleteClient(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteClient controller:', error);
      if (error.message === 'Client not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('active employee association')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchClients(req, res) {
    try {
      const clients = await clientService.searchClients(req.query.q);
      res.json(clients);
    } catch (error) {
      console.error('Error in searchClients controller:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getAllActiveClients(req, res) {
    try {
      const clients = await clientService.getAllActiveClients();
      res.json(clients);
    } catch (error) {
      console.error('Error in getAllActiveClients controller:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getAllInactiveClients(req, res) {
    try {
      const clients = await clientService.getAllInactiveClients();
      res.json(clients);
    } catch (error) {
      console.error('Error in getAllInactiveClients controller:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = clientController;