const express = require('express');
const router = express.Router();
const organisationController = require('../controllers/organisationController');

// Routes with controller references
router.post('/', organisationController.createOrganisation);
router.get('/', organisationController.getAllOrganisations);
router.put('/:id', organisationController.updateOrganisation);
router.delete('/:id', organisationController.deleteOrganisation);

module.exports = router;
