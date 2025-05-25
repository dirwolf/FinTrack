const { Op } = require('sequelize');
const Employee = require('../models/employeeModel');
const Organisation = require('../models/organisationModel');
const ClientEmployee = require('../models/clientEmployeeModel');
const Client = require('../models/clientModel');
const EmployeeCost = require('../models/employeeCostModel');
const FinancialYear = require('../models/financialYearModel');
const Level = require('../models/levelModel'); // Added import for Level model
const Role = require('../models/roleModel'); // Added import for Role model
const logger = require('../utils/logger');

const fiscalMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const createEmployee = async (employeeData, year) => {
  try {
    const existingEmployee = await Employee.findOne({
      where: { EmpCode: employeeData.EmpCode },
    });
    if (existingEmployee) {
      throw new Error('Employee with this code already exists');
    }

    // Create the employee
    const employee = await Employee.create(employeeData);

    // Get the current date
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (January is 0)
    const currentYear = now.getFullYear();

    // Determine fiscal year (starts in April, month 3)
    let fiscalYear;
    if (currentMonth >= 3) {
      fiscalYear = currentYear;
    } else {
      fiscalYear = currentYear - 1;
    }

    // Fiscal month names in order
    const fiscalMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

    // Determine the current fiscal month index (0-11)
    let fiscalMonthIndex;
    if (currentMonth >= 3) {
      fiscalMonthIndex = currentMonth - 3; // April is index 0
    } else {
      fiscalMonthIndex = currentMonth + 9; // Jan is 9, Feb is 10, Mar is 11
    }

    // Get financial years (current and future only)
    const financialYears = await FinancialYear.findAll({
      where: {
        year: {
          [Op.gte]: fiscalYear, // Only fetch current and future fiscal years
        },
      },
      order: [['year', 'ASC']],
    });

    if (financialYears.length === 0) {
      throw new Error('No financial years found');
    }

    const monthlyCTC = employee.CTCMonthly || 0; // Fallback to 0 if CTCMonthly is not set

    // Create employee cost records for current and future financial years
    const employeeCosts = financialYears.map((fy) => {
      const costRecord = {
        EmployeeID: employee.id,
        Year: parseInt(fy.year, 10),
      };

      if (parseInt(fy.year, 10) === fiscalYear) {
        // For the current fiscal year, set costs from the current month onward
        fiscalMonths.forEach((month, index) => {
          if (index < fiscalMonthIndex) {
            costRecord[month] = 0; // Prior months are 0
          } else {
            costRecord[month] = parseFloat(monthlyCTC); // Current and future months get the salary
          }
        });
      } else {
        // For future fiscal years, set all months to monthly CTC
        fiscalMonths.forEach((month) => {
          costRecord[month] = parseFloat(monthlyCTC);
        });
      }

      return costRecord;
    });

    await EmployeeCost.bulkCreate(employeeCosts, {
      ignoreDuplicates: true, // Skip duplicates
    });

    return employee;
  } catch (error) {
    throw new Error(`Error creating employee: ${error.message}`);
  }
};

const updateEmployee = async (employeeId, updates) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    if (updates.EmpCode && updates.EmpCode !== employee.EmpCode) {
      const existingEmployee = await Employee.findOne({
        where: { EmpCode: updates.EmpCode }
      });
      if (existingEmployee) {
        throw new Error('Employee with this code already exists');
      }
    }

    // Update employee
    await employee.update(updates);

    // If CTC Annual is updated, update employee cost records
    if (updates.CTCAnnual) {
      const monthlyCTC = updates.CTCMonthly || (updates.CTCAnnual / 12);
      
      // Get current date
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11 (January is 0)
      const currentYear = now.getFullYear();

      // Determine fiscal year (starts in April, month 3)
      let fiscalYear;
      if (currentMonth >= 3) {
        fiscalYear = currentYear;
      } else {
        fiscalYear = currentYear - 1;
      }

      // Determine the current fiscal month index (0-11)
      let fiscalMonthIndex;
      if (currentMonth >= 3) {
        fiscalMonthIndex = currentMonth - 3; // April is index 0
      } else {
        fiscalMonthIndex = currentMonth + 9; // Jan is 9, Feb is 10, Mar is 11
      }

      // Get all employee cost records for current and future fiscal years
      const employeeCosts = await EmployeeCost.findAll({
        where: {
          EmployeeID: employeeId,
          Year: {
            [Op.gte]: fiscalYear
          }
        }
      });

      // Update each employee cost record
      for (const cost of employeeCosts) {
        const updates = {};
        
        // For current fiscal year, update only from current month onwards
        if (cost.Year === fiscalYear) {
          fiscalMonths.forEach((month, index) => {
            if (index >= fiscalMonthIndex) {
              updates[month] = monthlyCTC;
            }
          });
        } else {
          // For future fiscal years, update all months
          fiscalMonths.forEach(month => {
            updates[month] = monthlyCTC;
          });
        }

        await cost.update(updates);
      }
    }

    return employee;
  } catch (error) {
    throw new Error(`Error updating employee: ${error.message}`);
  }
};

const getAllEmployees = async (page = 1, limit = 10, query = '') => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = query
      ? {
          [Op.or]: [
            { FirstName: { [Op.like]: `%${query}%` } },
            { LastName: { [Op.like]: `%${query}%` } },
          ],
        }
      : {};

    const employees = await Employee.findAll({
      where: whereClause,
      include: [
        { model: Organisation, as: 'Organisation' },
        { model: Level, as: 'Level' }, // Added Level model
        { model: Role, as: 'Role' }, // Added Role model
      ],
      offset,
      limit
    });

    const total = await Employee.count({ where: whereClause });

    return {
      employees,
      total,
    };
  } catch (error) {
    throw new Error(`Error fetching employees: ${error.message}`);
  }
};

const getEmployeeById = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId, {
      include: [
        { model: Organisation, as: 'Organisation' },
        { model: Level, as: 'Level' }, // Added Level model
        { model: Role, as: 'Role' }, // Added Role model
      ]
    });
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  } catch (error) {
    throw new Error(`Error fetching employee: ${error.message}`);
  }
};

const deleteEmployee = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const activeAssignments = await ClientEmployee.findOne({
      where: { EmployeeID: employeeId, Status: 'Active' }
    });

    if (activeAssignments) {
      throw new Error('Cannot delete employee with active client assignments');
    }

    await employee.destroy();
    return { message: 'Employee deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting employee: ${error.message}`);
  }
};

const searchEmployees = async (query, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { FirstName: { [Op.like]: `%${query}%` } },
        { LastName: { [Op.like]: `%${query}%` } },
        { EmpCode: { [Op.like]: `%${query}%` } },
        { Email: { [Op.like]: `%${query}%` } },
      ],
    };

    const employees = await Employee.findAll({
      where: whereClause,
      include: [
        { model: Organisation, as: 'Organisation' },

        { model: Level, as: 'Level' },
        { model: Role, as: 'Role' },
      ],
      offset,
      limit,

     

    });

    const total = await Employee.count({ where: whereClause });

    return {
      employees,
      total,
    };
  } catch (error) {
    throw new Error(`Error searching employees: ${error.message}`);
  }
};
const getEmployeeClients = async (id) => {
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const clientAssignments = await ClientEmployee.findAll({
      where: { EmployeeID: id },
      include: [
        { model: Client, as: 'Client' }
      ]
    });

    return clientAssignments;
  } catch (error) {
    throw new Error(`Error fetching employee clients: ${error.message}`);
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  getEmployeeClients,
};