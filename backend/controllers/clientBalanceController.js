const { getClientBalanceReport } = require('../services/clientBalanceService');

const fetchClientBalanceReport = async (req, res) => {
  try {
    const report = await getClientBalanceReport();
    res.json(report);
  } catch (error) {
    console.error('Error fetching client balance report:', error);
    res.status(500).json({ message: 'Error fetching client balance report' });
  }
};

module.exports = {
  fetchClientBalanceReport,
};
