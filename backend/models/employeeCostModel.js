// models/employeeCostModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Employee = require('./employeeModel');

const EmployeeCost = sequelize.define('EmployeeCost', {
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
  uniqueKeys: {
    uniqueEmployeeCost: {
      fields: ['EmployeeID', 'Year'],
    },
  },
});

Employee.hasMany(EmployeeCost, { foreignKey: 'EmployeeID' });
EmployeeCost.belongsTo(Employee, { foreignKey: 'EmployeeID' });

module.exports = EmployeeCost;
