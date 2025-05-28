const express = require('express');
const router = express.Router();
const {
  fetchEmployeeCostsByYear,
  updateEmployeeCost
} = require('../controllers/employeeCostController');

// Route to get employee cost data by year
router.get('/:year', fetchEmployeeCostsByYear);

// Route to update a specific month’s cost for an employee
router.patch('/:id', updateEmployeeCost);

module.exports = router;
