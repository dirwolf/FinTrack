const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Client = require('./clientModel');

const PaymentTracker = sequelize.define('PaymentTracker', {
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
  ReceivedDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  Remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});
// Define associations
PaymentTracker.belongsTo(Client, { foreignKey: 'ClientID' });

module.exports = PaymentTracker;
