const organisationService = require('../services/organisationService');
const logger = require('../utils/logger');

const organisationController = {
  async getAllOrganisations(req, res) {
    try {
      const organisations = await organisationService.getAllOrganisations();
      res.json(organisations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOrganisationById(req, res) {
    try {
      const organisation = await organisationService.getOrganisationById(req.params.id);
      res.json(organisation);
    } catch (error) {
      if (error.message === 'Organisation not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createOrganisation(req, res) {
    try {
      const organisation = await organisationService.createOrganisation(req.body);
      res.status(201).json(organisation);
    } catch (error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async updateOrganisation(req, res) {
    try {
      const organisation = await organisationService.updateOrganisation(req.params.id, req.body);
      res.json(organisation);
    } catch (error) {
      if (error.message === 'Organisation not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteOrganisation(req, res) {
    try {
      const result = await organisationService.deleteOrganisation(req.params.id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Organisation not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('active clients')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchOrganisations(req, res) {
    try {
      const organisations = await organisationService.searchOrganisations(req.query.q);
      res.json(organisations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOrganisationClients(req, res) {
    try {
      const clients = await organisationService.getOrganisationClients(req.params.id);
      res.json(clients);
    } catch (error) {
      if (error.message === 'Organisation not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
};

module.exports = organisationController;
