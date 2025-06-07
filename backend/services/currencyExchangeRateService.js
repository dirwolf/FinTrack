const { Op } = require('sequelize');
const CurrencyExchangeRate = require('../models/currencyExchangeRateModel');
const Currency = require('../models/currencyModel');

const currencyExchangeRateService = {
  async getAllExchangeRates() {
    try {
      const rates = await CurrencyExchangeRate.findAll({
        include: [
          { model: Currency, as: 'CurrencyFrom' },
          { model: Currency, as: 'CurrencyTo' }
        ],
        order: [['Year', 'DESC']]
      });
      return rates;
    } catch (error) {
      throw new Error('Error fetching exchange rates: ' + error.message);
    }
  },

  async getExchangeRateById(id) {
    try {
      const rate = await CurrencyExchangeRate.findByPk(id, {
        include: [
          { model: Currency, as: 'CurrencyFrom' },
          { model: Currency, as: 'CurrencyTo' }
        ]
      });
      if (!rate) {
        throw new Error('Exchange rate not found');
      }
      return rate;
    } catch (error) {
      throw new Error('Error fetching exchange rate: ' + error.message);
    }
  },

  
  async createExchangeRate(data) {
  try {
    console.log('Received data:', data);
    
    // Validate currency IDs exist first
    const fromCurrency = await Currency.findByPk(data.CurrencyFromID);
    const toCurrency = await Currency.findByPk(data.CurrencyToID);

    if (!fromCurrency || !toCurrency) {
      throw new Error('One or both currencies not found');
    }

    // Check for existing exchange rate
    const existing = await CurrencyExchangeRate.findOne({
      where: {
        CurrencyFromID: data.CurrencyFromID,
        CurrencyToID: data.CurrencyToID,
        Year: data.Year,
      }
    });

    if (existing) {
      throw new Error('Exchange rate already exists for this currency pair and period');
    }

    // Create the new exchange rate
    const rate = await CurrencyExchangeRate.create(data);

    // Fetch the created rate with associated Currency models
    const createdRate = await CurrencyExchangeRate.findByPk(rate.id, {
      include: [
        { model: Currency, as: 'CurrencyFrom' },
        { model: Currency, as: 'CurrencyTo' }
      ]
    });

    return createdRate;

  } catch (error) {
    console.error('Full error object:', error);
    console.error('Validation Error Details:', error.errors || error);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error('Field:', err.path, 'Message:', err.message);
      });
    }
    throw new Error('Error creating exchange rate: ' + error.message);
  }
},
  
  

  async updateExchangeRate(id, rateData) {
    try {
      const rate = await CurrencyExchangeRate.findByPk(id);
      if (!rate) {
        throw new Error('Exchange rate not found');
      }

      if (rateData.CurrencyFromID || rateData.CurrencyToID) {
        const [fromCurrency, toCurrency] = await Promise.all([
          Currency.findByPk(rateData.CurrencyFromID || rate.CurrencyFromID),
          Currency.findByPk(rateData.CurrencyToID || rate.CurrencyToID)
        ]);

        if (!fromCurrency || !toCurrency) {
          throw new Error('One or both currencies not found');
        }
      }

      if (rateData.Year || rateData.CurrencyFromID || rateData.CurrencyToID) {
        const existingRate = await CurrencyExchangeRate.findOne({
          where: {
            CurrencyFromID: rateData.CurrencyFromID || rate.CurrencyFromID,
            CurrencyToID: rateData.CurrencyToID || rate.CurrencyToID,
            Year: rateData.Year || rate.Year,
            id: { [Op.ne]: id }
          }
        });

        if (existingRate) {
          throw new Error('Exchange rate already exists for this currency pair and year');
        }
      }

      await rate.update(rateData);
      return rate;
    } catch (error) {
      throw new Error('Error updating exchange rate: ' + error.message);
    }
  },

  async deleteExchangeRate(id) {
    try {
      const rate = await CurrencyExchangeRate.findByPk(id);
      if (!rate) {
        throw new Error('Exchange rate not found');
      }
      await rate.destroy();
      return { message: 'Exchange rate deleted successfully' };
    } catch (error) {
      throw new Error('Error deleting exchange rate: ' + error.message);
    }
  },

  async searchExchangeRates(query) {
    try {
      const rates = await CurrencyExchangeRate.findAll({
        where: {
          Year: { [Op.like]: `%${query}%` }
        },
        include: [
          { model: Currency, as: 'CurrencyFrom' },
          { model: Currency, as: 'CurrencyTo' }
        ],
        order: [['Year', 'DESC']]
      });
      return rates;
    } catch (error) {
      throw new Error('Error searching exchange rates: ' + error.message);
    }
  },

  async getExchangeRateByCurrencies(fromCurrencyId, toCurrencyId, year) {
    try {
      const rate = await CurrencyExchangeRate.findOne({
        where: {
          CurrencyFromID: fromCurrencyId,
          CurrencyToID: toCurrencyId,
          Year: year
        },
        include: [
          { model: Currency, as: 'CurrencyFrom' },
          { model: Currency, as: 'CurrencyTo' }
        ]
      });
      if (!rate) {
        throw new Error('Exchange rate not found for the specified currencies and year');
      }
      return rate;
    } catch (error) {
      throw new Error('Error fetching exchange rate: ' + error.message);
    }
  }
};

module.exports = currencyExchangeRateService;
