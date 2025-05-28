const express = require('express');
const router = express.Router();
const { fetchClientBalanceReport } = require('../controllers/clientBalanceController');

router.get('/report', fetchClientBalanceReport);

module.exports = router;
