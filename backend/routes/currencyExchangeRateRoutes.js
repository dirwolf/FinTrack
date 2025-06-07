const express = require('express');
const router = express.Router();
const currencyExchangeRateController = require('../controllers/currencyExchangeRateController');

// Get all exchange rates
router.get('/', currencyExchangeRateController.getAllExchangeRates);

// Get exchange rate by ID
router.get('/:id', currencyExchangeRateController.getExchangeRateById);

// Create new exchange rate
router.post('/', currencyExchangeRateController.createExchangeRate);

// Update exchange rate
router.put('/:id', currencyExchangeRateController.updateExchangeRate);

// Delete exchange rate
router.delete('/:id', currencyExchangeRateController.deleteExchangeRate);

// Search exchange rates
router.get('/search', currencyExchangeRateController.searchExchangeRates);

// Get exchange rate by currencies
router.get('/rate', currencyExchangeRateController.getExchangeRateByCurrencies);

module.exports = router;
