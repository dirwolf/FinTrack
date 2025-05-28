// models/clientModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ClientName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Abbreviation: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  ContactPerson: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  RegisteredAddress: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  BillingCurrencyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  OrganisationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  BankDetailID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentLastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  paranoid: true, 
});

module.exports = Client;
