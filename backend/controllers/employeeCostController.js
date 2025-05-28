// const employeeCostService = require('../services/employeeCostService');
const logger = require('../utils/logger');
const {
  getEmployeeCostData,
  updateEmployeeCostData,
} = require('../services/employeeCostService');

const fetchEmployeeCostsByYear = async (req, res) => {
  const { year } = req.params;

  try {
    const data = await getEmployeeCostData(year);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmployeeCost = async (req, res) => {
  const { id } = req.params;
  const { month, amount } = req.body;

  if (!month || amount === undefined) {
    return res.status(400).json({ message: 'Month and amount are required' });
  }

  try {
    const updatedData = await updateEmployeeCostData(id, month, amount);
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchEmployeeCostsByYear,
  updateEmployeeCost,
};
