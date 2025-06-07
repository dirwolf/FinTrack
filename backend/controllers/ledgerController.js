const ledgerService = require('../services/ledgerService');
const logger = require('../utils/logger');

const getLedgerByClientAndDateRange = async (req, res) => {
  const { clientId, startDate, endDate } = req.body;

  if (!clientId || !startDate || !endDate) {
    return res.status(400).json({ error: 'clientId, startDate, and endDate are required' });
  }

  try {
    const ledgerData = await ledgerService.getLedgerEntriesByClientAndDateRange(clientId, startDate, endDate);
    res.status(200).json(ledgerData);
  } catch (error) {
    logger.error(`Error fetching ledger data: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch ledger data' });
  }
};

module.exports = {
  getLedgerByClientAndDateRange
};
