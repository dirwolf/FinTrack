const financialYearService = require('../services/financialYearService');
const logger = require('../utils/logger');

// Get paginated financial years
const getFinancialYears = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    logger.info('Get financial years service called');
    const years = await financialYearService.getFinancialYears({ page, limit });
    res.json(years);
  } catch (error) {
    logger.error(`Error fetching financial years: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch financial years' });
  }
};

// Add a new financial year
const addFinancialYear = async (req, res) => {
  try {
    const { year } = req.body;
    logger.info(`Adding new financial year: ${year}`);
    const result = await financialYearService.addFinancialYear(year);
    res.json(result);
  } catch (error) {
    logger.error(`Error adding financial year: ${error.message}`);
    res.status(500).json({ error: 'Failed to add financial year' });
  }
};

const createBillingDetails = async (req, res) => {
  try {
    const { year } = req.params;
    logger.info(`Creating billing details for year: ${year}`);
    const result = await financialYearService.createBillingDetailsForYear(year);
    res.json(result);
  } catch (error) {
    logger.error(`Error creating billing details: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFinancialYears,
  addFinancialYear,
  createBillingDetails
};
