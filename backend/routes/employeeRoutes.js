const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.get('/search/:query', employeeController.searchEmployees);
router.get('/:id/clients', employeeController.getEmployeeClients);
router.get('/search', employeeController.searchEmployees);
module.exports = router;
