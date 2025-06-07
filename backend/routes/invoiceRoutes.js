const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Generate invoices
router.post('/generate', invoiceController.generateInvoices);

// Get generated invoices
router.get('/generated/:year/:month', invoiceController.getGeneratedInvoices);

// Delete invoice
router.delete('/delete/:invoiceId', invoiceController.deleteInvoice);

// Download invoice
router.get('/download/:invoiceId', invoiceController.downloadInvoice);

// Mark invoice as sent
router.put('/mark-sent/:invoiceId', invoiceController.markInvoiceAsSent);

// Regenerate invoice
router.put('/regenerate/:invoiceId', invoiceController.regenerateInvoice);

// View invoice
router.get('/view/:filePath', invoiceController.viewInvoice);

module.exports = router;
