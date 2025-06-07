// routes/billingRoutes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// Get clients for a year
router.get('/clients/:year', billingController.getClientsForYear);

// Get billing data for a client and year
router.get('/data/:clientId/:year', billingController.getBillingData);

// Update billing data
router.put('/data/:id', billingController.updateBillingData);

module.exports = router;
