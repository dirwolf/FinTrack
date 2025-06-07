const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Client = require('./clientModel');

const Ledger = sequelize.define('Ledger', {
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
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  Balance: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Define associations
Ledger.belongsTo(Client, { foreignKey: 'ClientID' });

module.exports = Ledger;
