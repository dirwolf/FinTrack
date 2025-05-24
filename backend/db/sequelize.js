const { Sequelize } = require('sequelize');
const path = require('path');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../database/database.sqlite'),
  logging: false,
  define: {
    timestamps: true, // Enable timestamps by default
    underscored: false, // Use camelCase for fields
    freezeTableName: true, // Don't pluralize table names
  },
});

module.exports = sequelize; 