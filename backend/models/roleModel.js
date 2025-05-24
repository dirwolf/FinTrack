const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');


const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  RoleName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

module.exports = Role;
