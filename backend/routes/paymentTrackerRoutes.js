// routes/paymentTrackerRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentTrackerController');

router.post('/payment', controller.createPayment);
router.get('/payment/last-three/:clientId', controller.getLastThreePayments);
router.get('/reconciliation-note', controller.getReconciliationNote);
router.put('/reconciliation-note', controller.updateReconciliationNote);

module.exports = router;
