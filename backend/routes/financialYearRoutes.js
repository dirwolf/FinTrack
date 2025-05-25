const express = require('express');
const router = express.Router();
const financialYearController = require('../controllers/financialYearController');

// GET /api/financial-years?page=1&limit=2
router.get('/', financialYearController.getFinancialYears);

// POST /api/financial-years
router.post('/', financialYearController.addFinancialYear);

// POST /api/financial-years/create-billing/:year
router.post('/create-billing/:year', financialYearController.createBillingDetails);

module.exports = router;
