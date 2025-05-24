const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');

// Import models and associations
require('./models/associations');

// Import routes
const backupRoutes = require('./routes/backupRoutes');
const bankDetailRoutes = require('./routes/bankDetailRoutes');
const billingRoutes = require('./routes/billingRoutes');
const clientBalanceRoutes = require('./routes/clientBalanceRoutes');
const clientRoutes = require('./routes/clientRoutes');
const clientEmployeeRoutes = require('./routes/clientEmployeeRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const currencyExchangeRateRoutes = require('./routes/currencyExchangeRateRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const employeeCostRoutes = require('./routes/employeeCostRoutes');
const financialYearRoutes = require('./routes/financialYearRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const levelRoutes = require('./routes/levelRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const paymentTrackerRoutes = require('./routes/paymentTrackerRoutes');
const profitabilityRoutes = require('./routes/profitabilityRoutes');
const roleRoutes = require('./routes/roleRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Routes
app.use('/api/backup', backupRoutes);
app.use('/api/bank-details', bankDetailRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/client-balance', clientBalanceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/client-employees', clientEmployeeRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/exchange-rates', currencyExchangeRateRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-cost', employeeCostRoutes);
app.use('/api/financial-years', financialYearRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/payment-tracker', paymentTrackerRoutes);
app.use('/api/profitability', profitabilityRoutes);
app.use('/api/roles', roleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
