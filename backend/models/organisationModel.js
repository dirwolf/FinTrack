const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Organisation = sequelize.define('Organisation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  OrganisationName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  Abbreviation: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  RegNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
}, {
  timestamps: true,
  paranoid: true
});

module.exports = Organisation;
