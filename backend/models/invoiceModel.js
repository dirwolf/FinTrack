const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Client = require('./clientModel');
const Currency = require('./currencyModel');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ClientID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Client,
      key: 'id',
    },
  },
  BillingCurrencyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Currency,
      key: 'id',
    },
  },
  Year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  TotalAmount: {
    type: DataTypes.DECIMAL(18, 2),
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
  Status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  PdfPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  InvoicedOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  GeneratedOn: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  paranoid: true,
  tableName: 'Invoices' // Explicitly set the table name
});

// Define associations

module.exports = Invoice;
