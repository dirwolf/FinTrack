const { Op } = require('sequelize');
const BankDetail = require('../models/bankDetailModel');
const Client = require('../models/clientModel');

const bankDetailService = {
  async getAllBankDetails() {
    try {
      const bankDetails = await BankDetail.findAll();
      return bankDetails;
    } catch (error) {
      throw new Error(`Error fetching bank details: ${error.message}`);
    }
  },

  async getBankDetailById(id) {
    try {
      const bankDetail = await BankDetail.findByPk(id);
      if (!bankDetail) {
        throw new Error('Bank detail not found');
      }
      return bankDetail;
    } catch (error) {
      throw new Error(`Error fetching bank detail: ${error.message}`);
    }
  },

  async createBankDetail(bankDetailData) {
    try {
      const existingBank = await BankDetail.findOne({
        where: {
          [Op.or]: [
            { AccountNumber: bankDetailData.AccountNumber },
            { IFSC: bankDetailData.IFSC }
          ]
        }
      });

      if (existingBank) {
        throw new Error('Bank detail with this account number or IFSC code already exists');
      }

      const bankDetail = await BankDetail.create(bankDetailData);
      return bankDetail;
    } catch (error) {
      throw new Error(`Error creating bank detail: ${error.message}`);
    }
  },

  async updateBankDetail(id, bankDetailData) {
    try {
      const bankDetail = await BankDetail.findByPk(id);
      if (!bankDetail) {
        throw new Error('Bank detail not found');
      }

      if (bankDetailData.AccountNumber || bankDetailData.IFSC) {
        const existingBank = await BankDetail.findOne({
          where: {
            [Op.or]: [
              { AccountNumber: bankDetailData.AccountNumber },
              { IFSC: bankDetailData.IFSC }
            ],
            id: { [Op.ne]: id }
          }
        });

        if (existingBank) {
          throw new Error('Bank detail with this account number or IFSC code already exists');
        }
      }

      await bankDetail.update(bankDetailData);
      return bankDetail;
    } catch (error) {
      throw new Error(`Error updating bank detail: ${error.message}`);
    }
  },

  async deleteBankDetail(id) {
    try {
      const bankDetail = await BankDetail.findByPk(id);
      if (!bankDetail) {
        throw new Error('Bank detail not found');
      }

      const activeClients = await Client.findOne({
        where: { BankDetailID: id }
      });

      if (activeClients) {
        throw new Error('Cannot delete bank detail with active clients');
      }

      await bankDetail.destroy();
      return { message: 'Bank detail deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting bank detail: ${error.message}`);
    }
  },

  async searchBankDetails(query) {
    try {
      const bankDetails = await BankDetail.findAll({
        where: {
          [Op.or]: [
            { BankName: { [Op.like]: `%${query}%` } },
            { AccountNumber: { [Op.like]: `%${query}%` } },
            { IFSC: { [Op.like]: `%${query}%` } }
          ]
        }
      });
      return bankDetails;
    } catch (error) {
      throw new Error(`Error searching bank details: ${error.message}`);
    }
  },

  async getBankDetailClients(id) {
    try {
      const bankDetail = await BankDetail.findByPk(id);
      if (!bankDetail) {
        throw new Error('Bank detail not found');
      }

      const clients = await Client.findAll({
        where: { BankDetailID: id }
      });

      return clients;
    } catch (error) {
      throw new Error(`Error fetching bank detail clients: ${error.message}`);
    }
  }
};

module.exports = bankDetailService;
