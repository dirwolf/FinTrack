const sequelize = require('./sequelize');

const connectDB = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };
