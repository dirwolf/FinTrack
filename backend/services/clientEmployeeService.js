// Fix for clientEmployeeService.js
const { Op } = require('sequelize');
const ClientEmployee = require('../models/clientEmployeeModel');
const Client = require('../models/clientModel');
const Employee = require('../models/employeeModel');
const BillingDetail = require('../models/billingDetailModel'); // Correct import
const Role = require('../models/roleModel');
const Level = require('../models/levelModel');
const Organisation = require('../models/organisationModel');
const Currency = require('../models/currencyModel'); // Add this if Currency model exists
const sequelize = require('../db/sequelize');

const clientEmployeeService = {
  async getAllClientEmployees() {
    try {
      const clientEmployees = await ClientEmployee.findAll({
        include: [
          {
            model: Client,
            attributes: ['ClientName'],
            paranoid: false // Include soft-deleted clients
          },
          {
            model: Employee,
            attributes: ['FirstName', 'LastName', 'EmpCode'],
            include: [
              { model: Role, as: 'Role', attributes: ['RoleName'] },
              { model: Level, as: 'Level', attributes: ['LevelName'] },
              { model: Organisation, as: 'Organisation', attributes: ['Abbreviation'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return clientEmployees;
    } catch (error) {
      throw new Error('Error fetching client employees: ' + error.message);
    }
  },

  async getClientEmployeeById(id) {
    try {
      const clientEmployee = await ClientEmployee.findByPk(id, {
        include: [
          {
            model: Client,
            attributes: ['ClientName'],
            paranoid: false // Include soft-deleted clients
          },
          {
            model: Employee,
            attributes: ['FirstName', 'LastName', 'EmpCode'],
            include: [
              { model: Role, as: 'Role', attributes: ['RoleName'] },
              { model: Level, as: 'Level', attributes: ['LevelName'] },
              { model: Organisation, as: 'Organisation', attributes: ['Abbreviation'] }
            ]
          }
        ]
      });
      if (!clientEmployee) {
        throw new Error('Client employee not found');
      }
      return clientEmployee;
    } catch (error) {
      throw new Error('Error fetching client employee: ' + error.message);
    }
  },

  async createClientEmployee(clientEmployeeData) {
    const transaction = await sequelize.transaction();
    try {
      console.log('Creating client employee with data:', clientEmployeeData); // Log incoming payload

      // Check for existing record (including soft-deleted)
      const existingRecord = await ClientEmployee.findOne({
        where: {
          EmployeeID: clientEmployeeData.EmployeeID,
          ClientID: clientEmployeeData.ClientID,
        },
        paranoid: false, // Include soft-deleted records
      });

      if (existingRecord) {
        if (existingRecord.deletedAt) {
          await existingRecord.restore({ transaction });
          await existingRecord.update(clientEmployeeData, { transaction });
          return existingRecord;
        }
        throw new Error('This employee is already assigned to this client');
      }

      // Validate foreign keys
      const employee = await Employee.findByPk(clientEmployeeData.EmployeeID);
      if (!employee) {
        throw new Error('Invalid EmployeeID: Employee not found');
      }
      const client = await Client.findByPk(clientEmployeeData.ClientID);
      if (!client) {
        throw new Error('Invalid ClientID: Client not found');
      }

      // Create ClientEmployee record
      const clientEmployee = await ClientEmployee.create(clientEmployeeData, { transaction });

      // Create or update BillingDetail record
      const startDate = new Date(clientEmployeeData.StartDate);
      const year = startDate.getFullYear();
      const startMonth = startDate.getMonth(); // 0 = Jan, 4 = May, etc.

      const fiscalMonths = [
        'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
      ];

      // Prepare billing data
      const billingData = {
        EmployeeID: clientEmployeeData.EmployeeID,
        ClientID: clientEmployeeData.ClientID,
        Year: year,
      };

      // Set billing amounts based on StartDate
      fiscalMonths.forEach((month, index) => {
        const fiscalMonthIndex = index;
        const calendarMonth = (fiscalMonthIndex + 3) % 12; // Apr=3, May=4, ..., Mar=2
        const isNextYear = fiscalMonthIndex >= 9; // Jan, Feb, Mar
        const billingYear = isNextYear ? year + 1 : year;

        if (
          (billingYear > year) ||
          (billingYear === year && calendarMonth >= startMonth)
        ) {
          billingData[month] = clientEmployeeData.MonthlyBilling || 0;
        } else {
          billingData[month] = 0;
        }
      });

      // Create or update BillingDetail
      await BillingDetail.upsert(billingData, { transaction });

      await transaction.commit();
      return clientEmployee;
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        throw new Error('Validation error: ' + JSON.stringify(errors));
      } else if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('This employee is already assigned to this client');
      }
      console.error('Error creating client employee:', error); // Log full error
      throw new Error('Error creating client employee: ' + error.message);
    }
  },

  async updateClientEmployee(id, clientEmployeeData) {
    try {
      const clientEmployee = await ClientEmployee.findByPk(id);
      if (!clientEmployee) {
        throw new Error('Client employee not found');
      }

      await clientEmployee.update(clientEmployeeData);
      return clientEmployee;
    } catch (error) {
      throw new Error('Error updating client employee: ' + error.message);
    }
  },

  async deleteClientEmployee(id) {
    try {
      const clientEmployee = await ClientEmployee.findByPk(id);
      if (!clientEmployee) {
        throw new Error('Client employee not found');
      }
      if (clientEmployee.Status === 'Active') {
        throw new Error('Resource cannot be deleted in active state. Please set status to Inactive first.');
      }
      await clientEmployee.destroy();
      return { message: 'Resource deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async searchClientEmployees(query) {
    try {
      const clientEmployees = await ClientEmployee.findAll({
        where: {
          [Op.or]: [
            { '$Client.ClientName$': { [Op.like]: `%${query}%` } },
            { '$Employee.FirstName$': { [Op.like]: `%${query}%` } },
            { '$Employee.LastName$': { [Op.like]: `%${query}%` } },
            { '$Employee.EmpCode$': { [Op.like]: `%${query}%` } }
          ]
        },
        include: [
          {
            model: Client,
            attributes: ['ClientName'],
            paranoid: false // Include soft-deleted clients
          },
          {
            model: Employee,
            attributes: ['FirstName', 'LastName', 'EmpCode'],
            include: [
              { model: Role, as: 'Role', attributes: ['RoleName'] },
              { model: Level, as: 'Level', attributes: ['LevelName'] },
              { model: Organisation, as: 'Organisation', attributes: ['Abbreviation'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return clientEmployees;
    } catch (error) {
      throw new Error('Error searching client employees: ' + error.message);
    }
  },

  async getClientEmployeesByClient(clientId) {
    try {
      const clientEmployees = await ClientEmployee.findAll({
        where: { ClientID: clientId },
        include: [
          {
            model: Client,
            attributes: ['ClientName', 'Abbreviation', 'BillingCurrencyID'],
            include: [
              { 
                model: Currency, 
                as: 'BillingCurrency', 
                attributes: ['CurrencyCode', 'CurrencyName'] 
              }
            ],
            paranoid: false // Include soft-deleted clients
          },
          {
            model: Employee,
            attributes: ['FirstName', 'LastName', 'EmpCode'],
            include: [
              { model: Role, as: 'Role', attributes: ['RoleName'] },
              { model: Level, as: 'Level', attributes: ['LevelName'] },
              { model: Organisation, as: 'Organisation', attributes: ['Abbreviation'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return clientEmployees;
    } catch (error) {
      throw new Error('Error fetching client employees: ' + error.message);
    }
  },

  async getClientEmployeesByEmployee(employeeId) {
    try {
      const clientEmployees = await ClientEmployee.findAll({
        where: { EmployeeID: employeeId },
        include: [
          {
            model: Client,
            attributes: ['ClientName', 'Abbreviation', 'BillingCurrencyID'],
            paranoid: false, // Include soft-deleted clients to ensure we always get client data
            include: [
              {
                model: Currency,
                as: 'BillingCurrency',
                attributes: ['CurrencyCode']
              }
            ]
          },
          {
            model: Employee,
            attributes: ['FirstName', 'LastName', 'EmpCode'],
            include: [
              { model: Role, as: 'Role', attributes: ['RoleName'] },
              { model: Level, as: 'Level', attributes: ['LevelName'] },
              { model: Organisation, as: 'Organisation', attributes: ['Abbreviation'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return clientEmployees;
    } catch (error) {
      throw new Error('Error fetching client employees: ' + error.message);
    }
  },

  async getClientEmployeesByStatus(status) {
    try {
      const clientEmployees = await ClientEmployee.findAll({
        where: { Status: status },
        include: [
          {
            model: Client,
            attributes: ['ClientName'],
            paranoid: false // Include soft-deleted clients
          },
          {
            model: Employee,
            attributes: ['FirstName', 'LastName', 'EmpCode'],
            include: [
              { model: Role, as: 'Role', attributes: ['RoleName'] },
              { model: Level, as: 'Level', attributes: ['LevelName'] },
              { model: Organisation, as: 'Organisation', attributes: ['Abbreviation'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return clientEmployees;
    } catch (error) {
      throw new Error('Error fetching client employees by status: ' + error.message);
    }
  },

  async getClientEmployeeSummary() {
    try {
      const summary = await ClientEmployee.findAll({
        attributes: [
          'Status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['Status']
      });
      return summary;
    } catch (error) {
      throw new Error('Error fetching client employee summary: ' + error.message);
    }
  }
};

module.exports = clientEmployeeService;