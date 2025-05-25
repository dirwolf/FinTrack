const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Level = sequelize.define('Level', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  LevelName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

module.exports = Level;
