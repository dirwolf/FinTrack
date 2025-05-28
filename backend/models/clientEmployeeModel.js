const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const ClientEmployee = sequelize.define('ClientEmployee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  EmployeeID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ClientID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  StartDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  EndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  MonthlyBilling: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Active'
  }
}, {
  timestamps: true,
  paranoid: true,  // Enables soft delete
  indexes: [
    {
      unique: true,
      fields: ['EmployeeID', 'ClientID'],
      name: 'unique_employee_client'
    }
  ]
});

module.exports = ClientEmployee;
