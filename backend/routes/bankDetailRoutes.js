const express = require('express');
const router = express.Router();
const bankDetailController = require('../controllers/bankDetailController');

// Define your routes here
router.post('/create', bankDetailController.createBankDetail);
router.get('/all', bankDetailController.getAllBankDetails);
router.put('/update/:bankDetailId', bankDetailController.updateBankDetail);
router.delete('/delete/:bankDetailId', bankDetailController.deleteBankDetail);

module.exports = router;
