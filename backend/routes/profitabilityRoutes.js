const express = require('express');
const profitabilityController = require('../controllers/profitabilityController');

const router = express.Router();

// Route for client profitability report
router.get('/client-report/:clientId/:financialYear', profitabilityController.getClientProfitabilityReport);

// Route for employee profitability report
router.get('/employee-report/:financialYear', profitabilityController.getEmployeeProfitabilityReport);

// Route for client profitability report (all clients)
router.get('/clients-report/:financialYear', profitabilityController.getClientsProfitabilityReport);

module.exports = router;
