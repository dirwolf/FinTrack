const profitabilityService = require('../services/profitabilityService');
const logger = require('../utils/logger');

// Controller for client profitability report
const getClientProfitabilityReport = async (req, res) => {
  try {
    const { clientId, financialYear } = req.params;
    logger.info(`Get profitability report service called for clientId: ${clientId}, financialYear: ${financialYear}`);
    
    if (!clientId || !financialYear) {
      return res.status(400).json({ error: 'Client ID and Financial Year are required.' });
    }
    
    // Call the service to get the profitability report
    const reportData = await profitabilityService.getProfitabilityReport(clientId, financialYear);
    
    return res.json(reportData);
  } catch (error) {
    logger.error(`Error fetching profitability report: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Controller for employee profitability report
const getEmployeeProfitabilityReport = async (req, res) => {
  try {
    const { financialYear } = req.params;
    logger.info(`Get employee profitability report service called for financialYear: ${financialYear}`);
    
    if (!financialYear) {
      return res.status(400).json({ error: 'Financial Year is required.' });
    }
    
    // Call the service to get the employee profitability report
    const reportData = await profitabilityService.getEmployeeProfitabilityReport(financialYear);
    
    return res.json(reportData);
  } catch (error) {
    logger.error(`Error fetching employee profitability report: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Controller for client profitability report (all clients)
const getClientsProfitabilityReport = async (req, res) => {
  try {
    const { financialYear } = req.params;
    logger.info(`Get client profitability report service called for financialYear: ${financialYear}`);
    
    if (!financialYear) {
      return res.status(400).json({ error: 'Financial Year is required.' });
    }
    
    // Call the service to get the client profitability report
    const reportData = await profitabilityService.getClientProfitabilityReport(financialYear);
    
    return res.json(reportData);
  } catch (error) {
    logger.error(`Error fetching client profitability report: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getClientProfitabilityReport,
  getEmployeeProfitabilityReport,
  getClientsProfitabilityReport
};
