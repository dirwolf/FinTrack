const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connectDB');// Adjust the path as necessary

const Currency = sequelize.define('Currency', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  CurrencyCode: {
    type: DataTypes.STRING(10),
    unique: true,
    allowNull: false
  },
  CurrencyName: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

module.exports = Currency;
