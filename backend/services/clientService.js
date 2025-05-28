const { Op } = require('sequelize');
const Client = require('../models/clientModel');
const ClientEmployee = require('../models/clientEmployeeModel');
const Currency = require('../models/currencyModel');
const Organisation = require('../models/organisationModel');
const BankDetail = require('../models/bankDetailModel');

const clientService = {
  async getAllClients() {
    try {
      const clients = await Client.findAll({
        include: [
          { model: Organisation, as: 'Organisation' },
          { model: BankDetail, as: 'BankDetail' },
          { model: Currency, as: 'BillingCurrency' }
        ]
      });
      return clients;
    } catch (error) {
      throw new Error(`Error fetching clients: ${error.message}`);
    }
  },

  async getClientById(id) {
    try {
      const client = await Client.findByPk(id, {
        include: [
          { model: Organisation, as: 'Organisation' },
          { model: BankDetail, as: 'BankDetail' },
          { model: Currency, as: 'BillingCurrency' }
        ]
      });
      if (!client) {
        throw new Error('Client not found');
      }
      return client;
    } catch (error) {
      throw new Error(`Error fetching client: ${error.message}`);
    }
  },

  async createClient(clientData) {
    try {
      const client = await Client.create(clientData);
      return client;
    } catch (error) {
      throw new Error(`Error creating client: ${error.message}`);
    }
  },

  async updateClient(id, clientData) {
    try {
      const client = await Client.findByPk(id);
      if (!client) {
        throw new Error('Client not found');
      }
      await client.update(clientData);
      return client;
    } catch (error) {
      throw new Error(`Error updating client: ${error.message}`);
    }
  },

  async deleteClient(id) {
    try {
      const client = await Client.findByPk(id);
      if (!client) {
        throw new Error('Client not found');
      }

      // Check for active resources
      const activeResources = await ClientEmployee.findAll({
        where: {
          ClientID: id,
          Status: 'Active',
        },
      });

      if (activeResources.length > 0) {
        throw new Error('Client cannot be deleted with active employee association.');
      }

      await client.destroy();
      return { message: 'Client deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async searchClients(query) {
    try {
      const clients = await Client.findAll({
        where: {
          [Op.or]: [
            { ClientName: { [Op.like]: `%${query}%` } },
            { Abbreviation: { [Op.like]: `%${query}%` } },
            { ContactPerson: { [Op.like]: `%${query}%` } },
            { Email: { [Op.like]: `%${query}%` } }
          ]
        },
        include: [
          { model: Organisation, as: 'Organisation' },
          { model: BankDetail, as: 'BankDetail' },
          { model: Currency, as: 'BillingCurrency' }
        ]
      });
      return clients;
    } catch (error) {
      throw new Error(`Error searching clients: ${error.message}`);
    }
  },

  async getAllActiveClients() {
    try {
      // First get all active client employee records
      const activeClientEmployees = await ClientEmployee.findAll({
        where: { Status: 'Active' },
        attributes: ['ClientID'],
        group: ['ClientID']
      });

      // Extract client IDs
      const clientIds = activeClientEmployees.map(ce => ce.ClientID);
      
      // Handle case when no active clients are found
      if (clientIds.length === 0) {
        return [];
      }
      
      // Fetch the actual client records with their relationships
      const clients = await Client.findAll({
        where: { id: clientIds },
        include: [
          { model: Organisation, as: 'Organisation' },
          { model: BankDetail, as: 'BankDetail' },
          { model: Currency, as: 'BillingCurrency' }
        ]
      });
      
      return clients;
    } catch (error) {
      console.error('Error in getAllActiveClients:', error);
      throw new Error(`Error fetching active clients: ${error.message}`);
    }
  },

  async getAllInactiveClients() {
    try {
      // First get all inactive client employee records
      const inactiveClientEmployees = await ClientEmployee.findAll({
        where: { Status: 'Inactive' },
        attributes: ['ClientID'],
        group: ['ClientID']
      });

      // Extract client IDs
      const clientIds = inactiveClientEmployees.map(ce => ce.ClientID);
      
      // Handle case when no inactive clients are found
      if (clientIds.length === 0) {
        return [];
      }
      
      // Fetch the actual client records with their relationships
      const clients = await Client.findAll({
        where: { id: clientIds },
        include: [
          { model: Organisation, as: 'Organisation' },
          { model: BankDetail, as: 'BankDetail' },
          { model: Currency, as: 'BillingCurrency' }
        ]
      });
      
      return clients;
    } catch (error) {
      console.error('Error in getAllInactiveClients:', error);
      throw new Error(`Error fetching inactive clients: ${error.message}`);
    }
  }
};

module.exports = clientService;