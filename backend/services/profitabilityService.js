const { Op } = require('sequelize');
const BillingSetup = require('../models/billingDetailModel');
const CurrencyExchangeRate = require('../models/currencyExchangeRateModel');
const Currency = require('../models/currencyModel');
const Client = require('../models/clientModel');
const Employee = require('../models/employeeModel');
const EmployeeCost = require('../models/employeeCostModel');
const logger = require('../utils/logger');

/**
 * Generate a profitability report for a specific client in a given financial year
 * @param {number} clientId - ID of the client
 * @param {number} financialYear - Financial year for the report
 * @returns {Object} Monthly and yearly profitability data
 */
async function getProfitabilityReport(clientId, financialYear) {
  try {
    // Fetch client data
    const client = await Client.findOne({ where: { id: clientId } });
    if (!client) throw new Error('Client not found.');

    const billingCurrency = client.BillingCurrencyID;
    const inrCurrency = await Currency.findOne({ where: { CurrencyCode: 'INR' } });
    if (!inrCurrency) throw new Error('INR currency not found.');

    const inrCurrencyId = inrCurrency.id;
    logger.info(`INR currency ID: ${inrCurrencyId}`);

    // Fetch billing data for the selected client and financial year
    const billingData = await BillingSetup.findAll({
      where: { ClientID: clientId, Year: financialYear },
    });
    if (!billingData.length) throw new Error('No billing data found for the selected client and financial year.');

    logger.info(`Billing data: ${JSON.stringify(billingData, null, 2)}`);

    // Fetch exchange rate
    const exchangeRate = await CurrencyExchangeRate.findOne({
      where: { CurrencyFromID: billingCurrency, CurrencyToID: inrCurrencyId, Year: financialYear },
    });
    if (!exchangeRate) throw new Error('No exchange rate found for the billing currency.');

    logger.info(`Exchange rate: ${JSON.stringify(exchangeRate)}`);

    // Calculate billing amounts in INR for each month
    const billingAmountsInINR = {};
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    months.forEach(month => {
      billingAmountsInINR[month] = billingData.reduce((total, billing) => total + billing[month] * exchangeRate.Rate, 0);
      logger.info(`Billing in INR for ${month}: ${billingAmountsInINR[month]}`);
    });

    // Calculate total salaries in INR for each month considering the number of clients
    const totalSalariesInINR = {};
    const employeeClientCounts = {};

    // Initialize salary totals for each month
    for (const month of months) totalSalariesInINR[month] = 0;

    for (const billing of billingData) {
      const salaryRecord = await EmployeeCost.findOne({
        where: { EmployeeID: billing.EmployeeID, Year: financialYear },
      });
      if (!salaryRecord) throw new Error(`No salary record found for employee ID ${billing.EmployeeID}.`);

      // Determine the number of clients the employee is billed under for each month
      if (!employeeClientCounts[billing.EmployeeID]) {
        employeeClientCounts[billing.EmployeeID] = {};
        for (const month of months) {
          const clientCount = await BillingSetup.count({
            where: {
              EmployeeID: billing.EmployeeID,
              Year: financialYear,
              [month]: { [Op.gt]: 0 } // Only count active months with billing > 0
            }
          });
          employeeClientCounts[billing.EmployeeID][month] = clientCount;
        }
      }

      months.forEach(month => {
        const clientCount = employeeClientCounts[billing.EmployeeID][month];
        if (clientCount > 0 && billing[month] > 0) {
          totalSalariesInINR[month] += salaryRecord[month] / clientCount;
        } // If billing is 0 for this client, do not deduct salary for this employee in that month
      });
      
      logger.info(`Salary in INR for employee ${billing.EmployeeID}: ${JSON.stringify(salaryRecord, null, 2)}`);
    }

    // Log total salaries for each month
    Object.entries(totalSalariesInINR).forEach(([month, amount]) => {
      logger.info(`Total salary in INR for ${month}: ${amount}`);
    });

    // Calculate monthly profits
    const monthlyProfits = {};
    months.forEach(month => {
      monthlyProfits[month] = billingAmountsInINR[month] - totalSalariesInINR[month];
      logger.info(`Profit for ${month}: ${monthlyProfits[month]}`);
    });

    // Calculate top 5 employees and others' profit for each month
    const employeeContributionsMonthly = [];

    for (const billing of billingData) {
      const salaryRecord = await EmployeeCost.findOne({
        where: { EmployeeID: billing.EmployeeID, Year: financialYear },
      });
      if (!salaryRecord) throw new Error(`No salary record found for employee ID ${billing.EmployeeID}.`);

      const employeeName = await Employee.findOne({
        where: { id: billing.EmployeeID },
        attributes: ['FirstName', 'LastName'],
      });

      const fullName = `${employeeName.FirstName} ${employeeName.LastName}`;
      const monthlyContributions = {};

      months.forEach(month => {
        const clientCount = employeeClientCounts[billing.EmployeeID][month];
        if (clientCount > 0 && billing[month] > 0) {
          monthlyContributions[month] = (billing[month] * exchangeRate.Rate) - (salaryRecord[month] / clientCount);
        } else if (billing[month] > 0) {
          monthlyContributions[month] = (billing[month] * exchangeRate.Rate);
        } else {
          monthlyContributions[month] = 0;
        }
      });

      employeeContributionsMonthly.push({
        name: fullName,
        monthlyContributions,
      });
    }

    const allEmployeesMonthlyData = {};
    months.forEach(month => {
      const sortedContributions = employeeContributionsMonthly
        .map(contribution => ({
          name: contribution.name,
          profit: contribution.monthlyContributions[month],
        }))
        .sort((a, b) => b.profit - a.profit);

      const top5 = sortedContributions.slice(0, 5);
      const others = sortedContributions.slice(5).reduce((sum, employee) => sum + employee.profit, 0);

      allEmployeesMonthlyData[month] = [...top5, { name: 'Others', profit: others }, { name: 'Total Profit', profit: monthlyProfits[month] }];
    });

    logger.info(`Monthly data with Top 5 employees, Others, and Total Profit: ${JSON.stringify(allEmployeesMonthlyData, null, 2)}`);

    // Calculate yearly data
    const totalEmployeeContributions = {};
    employeeContributionsMonthly.forEach(contribution => {
      months.forEach(month => {
        totalEmployeeContributions[contribution.name] = (totalEmployeeContributions[contribution.name] || 0) + contribution.monthlyContributions[month];
      });
    });

    const sortedYearlyContributions = Object.entries(totalEmployeeContributions)
      .map(([name, profit]) => ({ name, profit }))
      .sort((a, b) => b.profit - a.profit);

    const top5EmployeesYearly = sortedYearlyContributions.slice(0, 5);
    const othersYearlyProfit = sortedYearlyContributions.slice(5).reduce((sum, employee) => sum + employee.profit, 0);
    const totalYearlyProfit = Object.values(monthlyProfits).reduce((sum, profit) => sum + profit, 0);

    const yearlyData = [
      ...top5EmployeesYearly,
      { name: 'Others', profit: othersYearlyProfit },
      { name: 'Total Profit', profit: totalYearlyProfit },
    ];

    logger.info(`Yearly data with Top 5 employees, Others, and Total Profit: ${JSON.stringify(yearlyData, null, 2)}`);

    return {
      monthlyData: allEmployeesMonthlyData,
      yearlyData,
    };
  } catch (error) {
    logger.error(`Error generating profitability report: ${error.message}`);
    throw new Error(`Error generating profitability report: ${error.message}`);
  }
}

/**
 * Generate profitability report for all employees in a given financial year
 * @param {number} financialYear - Financial year for the report
 * @returns {Object} Employee profitability data
 */
async function getEmployeeProfitabilityReport(financialYear) {
  try {
    // Step 1: Fetch all unique employees for the FY
    const billingData = await BillingSetup.findAll({
      where: { Year: financialYear },
      include: [
        { model: Employee, attributes: ['id', 'FirstName', 'LastName'] },
        { model: Client, attributes: ['Abbreviation', 'BillingCurrencyID'] },
      ],
    });

    if (!billingData.length) {
      throw new Error('No billing data found for the selected financial year.');
    }

    // Step 2: Initialize the data structure
    const employeeData = {};

    for (const billing of billingData) {
      const employeeId = billing.Employee.id;
      const clientAbbreviation = billing.Client.Abbreviation;
      const billingCurrency = billing.Client.BillingCurrencyID;

      // Fetch the exchange rate from billing currency to INR
      const inrCurrency = await Currency.findOne({ where: { CurrencyCode: 'INR' } });
      if (!inrCurrency) throw new Error('INR currency not found.');

      const exchangeRate = await CurrencyExchangeRate.findOne({
        where: {
          CurrencyFromID: billingCurrency,
          CurrencyToID: inrCurrency.id,
          Year: financialYear,
        },
      });

      if (!exchangeRate) {
        throw new Error(`No exchange rate found for currency ${billingCurrency}.`);
      }

      // Initialize employee entry if not already present
      if (!employeeData[employeeId]) {
        employeeData[employeeId] = {
          name: `${billing.Employee.FirstName} ${billing.Employee.LastName}`,
          clients: [],
          monthlyProfit: {
            Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0, Jan: 0, Feb: 0, Mar: 0,
          },
          averageProfit: 0, // Separate averageProfit field
        };
      }

      // Add the client's abbreviation to the employee's client list
      if (!employeeData[employeeId].clients.includes(clientAbbreviation)) {
        employeeData[employeeId].clients.push(clientAbbreviation);
      }

      // Convert and sum billing amounts to INR for each month
      for (const month in employeeData[employeeId].monthlyProfit) {
        employeeData[employeeId].monthlyProfit[month] += billing[month] * exchangeRate.Rate;
      }
    }

    // Step 3: Subtract employee costs from monthly profit to get net profit for each month
    for (const employeeId in employeeData) {
      const employeeCost = await EmployeeCost.findOne({
        where: {
          EmployeeID: employeeId,
          Year: financialYear,
        },
      });

      if (!employeeCost) {
        throw new Error(`No salary record found for employee ID ${employeeId}.`);
      }

      // Subtract costs for each month and calculate total profit
      let totalProfit = 0;
      for (const month in employeeData[employeeId].monthlyProfit) {
        employeeData[employeeId].monthlyProfit[month] -= employeeCost[month];
        totalProfit += employeeData[employeeId].monthlyProfit[month]; // Sum up the profits
      }

      // Calculate the average profit and update the averageProfit field
      employeeData[employeeId].averageProfit = totalProfit / 12;
    }

    // Log the structured employee data
    logger.info(`Employee profitability data: ${JSON.stringify(employeeData, null, 2)}`);

    return employeeData;
  } catch (error) {
    logger.error(`Error generating employee profitability report: ${error.message}`);
    throw new Error(`Error generating employee profitability report: ${error.message}`);
  }
}

/**
 * Generate profitability report for all clients in a given financial year
 * @param {number} financialYear - Financial year for the report
 * @returns {Object} Client profitability data
 */
async function getClientProfitabilityReport(financialYear) {
  try {
    // Step 1: Fetch all billing data for the specified financial year
    const billingData = await BillingSetup.findAll({
      where: { Year: financialYear },
      include: [
        { model: Employee, attributes: ['id', 'FirstName', 'LastName'] },
        { model: Client, attributes: ['id', 'ClientName', 'BillingCurrencyID'] },
      ],
    });

    if (!billingData.length) {
      throw new Error('No billing data found for the selected financial year.');
    }

    // Step 2: Initialize data structure to hold profitability by client
    const clientData = {};

    for (const billing of billingData) {
      const clientId = billing.Client.id;
      const clientName = billing.Client.ClientName;
      const billingCurrency = billing.Client.BillingCurrencyID;
      const employeeId = billing.Employee.id;

      // Fetch the exchange rate from billing currency to INR
      const inrCurrency = await Currency.findOne({ where: { CurrencyCode: 'INR' } });
      if (!inrCurrency) throw new Error('INR currency not found.');

      const exchangeRate = await CurrencyExchangeRate.findOne({
        where: {
          CurrencyFromID: billingCurrency,
          CurrencyToID: inrCurrency.id,
          Year: financialYear,
        },
      });

      if (!exchangeRate) {
        throw new Error(`No exchange rate found for currency ${billingCurrency}.`);
      }

      // Initialize client entry if not already present
      if (!clientData[clientId]) {
        clientData[clientId] = {
          clientName,
          monthlyProfit: {
            Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0, Jan: 0, Feb: 0, Mar: 0,
          },
        };
      }

      // Calculate and sum billing amounts to INR for each month
      for (const month in clientData[clientId].monthlyProfit) {
        if (billing[month] > 0) {
          // Find how many clients the employee is working for in this financial year with non-zero billing
          const clientsWithNonZeroBilling = await BillingSetup.count({
            where: {
              EmployeeID: employeeId,
              Year: financialYear,
              [`${month}`]: { [Op.gt]: 0 },
            },
          });

          // Get the employee cost and average it across the number of clients
          const employeeCost = await EmployeeCost.findOne({
            where: {
              EmployeeID: employeeId,
              Year: financialYear,
            },
          });

          if (!employeeCost) {
            throw new Error(`No salary record found for employee ID ${employeeId}.`);
          }

          // Calculate the monthly profit after deducting the averaged salary
          const adjustedSalary = employeeCost[month] / clientsWithNonZeroBilling;
          const monthlyProfit = (billing[month] * exchangeRate.Rate) - adjustedSalary;

          // Add the profit to the client's monthly profit, rounded to two decimal places
          clientData[clientId].monthlyProfit[month] += parseFloat(monthlyProfit.toFixed(2));
        }
      }
    }

    // Log the structured client data
    logger.info(`Client profitability data: ${JSON.stringify(clientData, null, 2)}`);

    return clientData;
  } catch (error) {
    logger.error(`Error generating client profitability report: ${error.message}`);
    throw new Error(`Error generating client profitability report: ${error.message}`);
  }
}

module.exports = {
  getProfitabilityReport,
  getEmployeeProfitabilityReport,
  getClientProfitabilityReport,
};