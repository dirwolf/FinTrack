const { Op } = require('sequelize');
const FinancialYear = require('../models/financialYearModel');
const ClientEmployee = require('../models/clientEmployeeModel');
const BillingDetail = require('../models/billingDetailModel');
const EmployeeCost = require('../models/employeeCostModel');
const Employee = require('../models/employeeModel');
const logger = require('../utils/logger');
const sequelize = require('../db/sequelize');

const getFinancialYears = async ({ page = 1, limit = 2 }) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await FinancialYear.findAndCountAll({
      order: [['year', 'DESC']],
      offset,
      limit,
    });

    return {
      total: count,
      financialYears: rows.map(year => year.toJSON()),
    };
  } catch (error) {
    logger.error(`Error fetching financial years: ${error.message}`);
    throw new Error(`Error fetching financial years: ${error.message}`);
  }
};

const addFinancialYear = async (year) => {
  const transaction = await sequelize.transaction();

  try {
    // Get the new financial year
    let newFinancialYear;
    if (year) {
      newFinancialYear = year;
    } else {
      const financialYears = await getFinancialYears({ page: 1, limit: 100 });
      if (financialYears.financialYears.length === 0) {
        logger.info('No financial years found, creating new financial year');
        newFinancialYear = `${new Date().getFullYear()}`;
      } else {
        logger.info('Financial years found, creating new financial year');
        const lastYear = parseInt(financialYears.financialYears[0].year, 10);
        newFinancialYear = `${lastYear + 1}`;
        logger.info(`Last year: ${lastYear}, new year: ${newFinancialYear}`);
      }
    }

    // Create the new financial year
    const financialYear = await FinancialYear.create({ year: newFinancialYear }, { transaction });
    logger.info(`New financial year created: ${newFinancialYear}`);

    // Get all active client employees
    const activeClientEmployees = await ClientEmployee.findAll({
      where: { 
        Status: 'Active',
        EndDate: {
          [Op.or]: [null, { [Op.gt]: new Date() }]
        }
      },
      include: [{
        model: Employee,
        where: { Status: 'Active' },
        required: true
      }]
    });

    logger.info(`Active client employees found: ${activeClientEmployees.length}`);
    logger.info('Active client employees:', JSON.stringify(activeClientEmployees.map(ce => ({
      EmployeeID: ce.EmployeeID,
      ClientID: ce.ClientID,
      MonthlyBilling: ce.MonthlyBilling,
      Status: ce.Status,
      EmployeeStatus: ce.Employee.Status
    })), null, 2));

    // Create billing details for active client employees
    const billingDetails = activeClientEmployees.map(clientEmployee => ({
      EmployeeID: clientEmployee.EmployeeID,
      ClientID: clientEmployee.ClientID,
      Year: parseInt(newFinancialYear, 10),
      Apr: clientEmployee.MonthlyBilling,
      May: clientEmployee.MonthlyBilling,
      Jun: clientEmployee.MonthlyBilling,
      Jul: clientEmployee.MonthlyBilling,
      Aug: clientEmployee.MonthlyBilling,
      Sep: clientEmployee.MonthlyBilling,
      Oct: clientEmployee.MonthlyBilling,
      Nov: clientEmployee.MonthlyBilling,
      Dec: clientEmployee.MonthlyBilling,
      Jan: clientEmployee.MonthlyBilling,
      Feb: clientEmployee.MonthlyBilling,
      Mar: clientEmployee.MonthlyBilling,
    }));

    if (billingDetails.length > 0) {
      logger.info('Creating billing details:', JSON.stringify(billingDetails, null, 2));
      
      // First check for existing billing details
      const existingBillingDetails = await BillingDetail.findAll({
        where: {
          Year: parseInt(newFinancialYear, 10),
          [Op.or]: billingDetails.map(detail => ({
            EmployeeID: detail.EmployeeID,
            ClientID: detail.ClientID
          }))
        }
      });

      logger.info(`Found ${existingBillingDetails.length} existing billing details`);

      // Filter out any that already exist
      const newBillingDetails = billingDetails.filter(detail => 
        !existingBillingDetails.some(existing => 
          existing.EmployeeID === detail.EmployeeID && 
          existing.ClientID === detail.ClientID
        )
      );

      logger.info(`Creating ${newBillingDetails.length} new billing details`);

      if (newBillingDetails.length > 0) {
        const createdBillingDetails = await BillingDetail.bulkCreate(newBillingDetails, { 
          transaction
        });
        logger.info(`Created billing details for ${createdBillingDetails.length} client employees`);
      } else {
        logger.info('No new billing details to create');
      }
    } else {
      logger.warn('No billing details to create');
    }

    // Get all active employees
    const activeEmployees = await Employee.findAll({
      where: { Status: 'Active' }
    });

    logger.info(`Active employees found: ${activeEmployees.length}`);

    // Create employee costs for active employees
    const employeeCosts = activeEmployees.map(employee => {
      // Get the employee's CTCMonthly value
      const monthlyCTC = employee.CTCMonthly || 0;
      logger.info(`Creating employee cost for employee ${employee.id} with monthly CTC: ${monthlyCTC}`);
      
      return {
        EmployeeID: employee.id,
        Year: parseInt(newFinancialYear, 10),
        Apr: monthlyCTC,
        May: monthlyCTC,
        Jun: monthlyCTC,
        Jul: monthlyCTC,
        Aug: monthlyCTC,
        Sep: monthlyCTC,
        Oct: monthlyCTC,
        Nov: monthlyCTC,
        Dec: monthlyCTC,
        Jan: monthlyCTC,
        Feb: monthlyCTC,
        Mar: monthlyCTC,
      };
    });

    if (employeeCosts.length > 0) {
      const createdCosts = await EmployeeCost.bulkCreate(employeeCosts, { 
        transaction,
        ignoreDuplicates: true // This will skip any duplicates instead of failing
      });
      logger.info(`Created employee costs for ${createdCosts.length} employees`);
    }

    await transaction.commit();
    logger.info('Transaction committed successfully');

    return financialYear;

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error adding financial year: ${error.message}`);
    throw new Error(`Error adding financial year: ${error.message}`);
  }
};

const createBillingDetailsForYear = async (year) => {
  const transaction = await sequelize.transaction();

  try {
    logger.info(`Creating billing details for year: ${year}`);
    const parsedYear = parseInt(year, 10);

    // Get all active client employees
    const activeClientEmployees = await ClientEmployee.findAll({
      where: { 
        Status: 'Active',
        EndDate: {
          [Op.or]: [null, { [Op.gt]: new Date() }]
        }
      },
      include: [{
        model: Employee,
        where: { Status: 'Active' },
        required: true
      }]
    });

    logger.info(`Found ${activeClientEmployees.length} active client employees`);

    const fiscalMonths = [
      'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
    ];

    // Create billing details for active client employees
    const billingDetails = activeClientEmployees.map(clientEmployee => {
      const startDate = new Date(clientEmployee.StartDate);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth(); // 0 = Jan, 4 = May, etc.

      const billingData = {
        EmployeeID: clientEmployee.EmployeeID,
        ClientID: clientEmployee.ClientID,
        Year: parsedYear,
      };

      // Set billing amounts based on StartDate
      fiscalMonths.forEach((month, index) => {
        const fiscalMonthIndex = index;
        const calendarMonth = (fiscalMonthIndex + 3) % 12; // Apr=3, May=4, ..., Mar=2
        const isNextYear = fiscalMonthIndex >= 9; // Jan, Feb, Mar
        const billingYear = isNextYear ? parsedYear + 1 : parsedYear;

        if (
          (billingYear > startYear) ||
          (billingYear === startYear && calendarMonth >= startMonth)
        ) {
          billingData[month] = clientEmployee.MonthlyBilling || 0;
        } else {
          billingData[month] = 0;
        }
      });

      return billingData;
    });

    if (billingDetails.length > 0) {
      logger.info('Creating billing details:', JSON.stringify(billingDetails, null, 2));
      
      // First check for existing billing details
      const existingBillingDetails = await BillingDetail.findAll({
        where: {
          Year: parsedYear,
          [Op.or]: billingDetails.map(detail => ({
            EmployeeID: detail.EmployeeID,
            ClientID: detail.ClientID
          }))
        }
      });

      logger.info(`Found ${existingBillingDetails.length} existing billing details`);

      // Filter out any that already exist
      const newBillingDetails = billingDetails.filter(detail => 
        !existingBillingDetails.some(existing => 
          existing.EmployeeID === detail.EmployeeID && 
          existing.ClientID === detail.ClientID
        )
      );

      logger.info(`Creating ${newBillingDetails.length} new billing details`);

      if (newBillingDetails.length > 0) {
        const createdBillingDetails = await BillingDetail.bulkCreate(newBillingDetails, { 
          transaction
        });
        logger.info(`Created billing details for ${createdBillingDetails.length} client employees`);
      } else {
        logger.info('No new billing details to create');
      }
    } else {
      logger.warn('No billing details to create');
    }

    await transaction.commit();
    logger.info('Transaction committed successfully');

    return { 
      success: true, 
      message: 'Billing details created successfully',
      createdCount: billingDetails.length
    };

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error creating billing details: ${error.message}`);
    throw new Error(`Error creating billing details: ${error.message}`);
  }
};

module.exports = {
  getFinancialYears,
  addFinancialYear,
  createBillingDetailsForYear
};
