const { Op } = require('sequelize');
const EmployeeCost = require('../models/employeeCostModel');
const Employee = require('../models/employeeModel');

const getEmployeeCostData = async (year) => {
  try {
    console.log(`Fetching employee costs for year: ${year}`);
    
    const employeeCosts = await EmployeeCost.findAll({
      where: { Year: parseInt(year, 10) },
      include: [
        {
          model: Employee,
          attributes: ['FirstName', 'LastName'],
          where: { Status: 'Active' }, // Only include active employees
          required: true,
        },
      ],
    });

    console.log(`Found ${employeeCosts.length} employee costs for year ${year}`);

    if (!employeeCosts || employeeCosts.length === 0) {
      console.log(`No employee costs found for year ${year}`);
      return [];
    }

    const formattedData = employeeCosts.map((cost) => ({
      id: cost.id,
      name: `${cost.Employee.FirstName} ${cost.Employee.LastName}`,
      Apr: cost.Apr,
      May: cost.May,
      Jun: cost.Jun,
      Jul: cost.Jul,
      Aug: cost.Aug,
      Sep: cost.Sep,
      Oct: cost.Oct,
      Nov: cost.Nov,
      Dec: cost.Dec,
      Jan: cost.Jan,
      Feb: cost.Feb,
      Mar: cost.Mar,
    }));

    console.log('Formatted employee cost data:', formattedData);
    return formattedData;
  } catch (error) {
    console.error(`Error fetching employee cost data: ${error.message}`);
    throw new Error(`Error fetching employee cost data: ${error.message}`);
  }
};

const updateEmployeeCostData = async (id, month, amount) => {
  try {
    const employeeCost = await EmployeeCost.findByPk(id);

    if (!employeeCost) {
      throw new Error(`EmployeeCost with id ${id} not found`);
    }

    employeeCost[month] = parseFloat(amount);
    await employeeCost.save();

    return employeeCost;
  } catch (error) {
    throw new Error(`Error updating employee cost data: ${error.message}`);
  }
};

module.exports = {
  getEmployeeCostData,
  updateEmployeeCostData,
};
