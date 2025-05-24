const express = require('express');
const roleController = require('../controllers/roleController'); // Import role controller
const router = express.Router();

// Define routes for role management
router.post('/', roleController.createRole); // POST - Create a new role
router.get('/', roleController.getAllRoles); // GET - Fetch all roles
router.put('/:roleId', roleController.updateRole); // PUT - Update a role by ID
router.delete('/:roleId', roleController.deleteRole); // DELETE - Delete a role by ID
router.get('/:roleId', roleController.getRoleById);

module.exports = router;
