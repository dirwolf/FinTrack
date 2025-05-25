const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connectDB');
const Currency = require('./currencyModel');

const CurrencyExchangeRate = sequelize.define('CurrencyExchangeRate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  CurrencyFromID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Currency,
      key: 'id',
    },
  },
  CurrencyToID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Currency,
      key: 'id',
    },
  },
  Rate: {
    type: DataTypes.DECIMAL(18),
    allowNull: false,
  },
  Year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'CurrencyExchangeRate'
});

module.exports = CurrencyExchangeRate;
