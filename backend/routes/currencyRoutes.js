const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

router.post('/', currencyController.createCurrency);
router.get('/', currencyController.getAllCurrencies);
router.put('/:id', currencyController.updateCurrency);
router.delete('/:id', currencyController.deleteCurrency);

module.exports = router;
