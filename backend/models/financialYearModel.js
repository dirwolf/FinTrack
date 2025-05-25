// models/financialYearModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');


const FinancialYear = sequelize.define('FinancialYear', {
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: false,
});

module.exports = FinancialYear;
