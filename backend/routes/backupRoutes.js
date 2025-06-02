const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

// Create a new backup
router.post('/', backupController.backupDatabase);

// Restore from a backup
router.post('/restore', backupController.restoreDatabase);

router.get('/download/:filename', backupController.downloadBackup);
module.exports = router;
