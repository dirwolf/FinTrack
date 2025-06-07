// models/billingDetailModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Client = require('./clientModel');
const Employee = require('./employeeModel');

const BillingDetail = sequelize.define('BillingDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  EmployeeID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee,
      key: 'id',
    },
  },
  ClientID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Client,
      key: 'id',
    },
  },
  Year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Apr: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  May: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Jun: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Jul: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Aug: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Sep: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Oct: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Nov: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Dec: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Jan: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Feb: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
  Mar: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['EmployeeID', 'ClientID', 'Year']
    }
  ]
});



module.exports = BillingDetail;
