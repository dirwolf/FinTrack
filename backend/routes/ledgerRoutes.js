const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');

router.post('/by-client-date-range', ledgerController.getLedgerByClientAndDateRange);

module.exports = router;
