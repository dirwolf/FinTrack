const { Op } = require('sequelize');
const Role = require('../models/roleModel');
const Employee = require('../models/employeeModel');
const logger = require('../utils/logger');

// Service methods to interact with the database

// Create a new role
const createRole = async (roleData) => {
  try {
    const existingRole = await Role.findOne({
      where: { RoleName: roleData.RoleName }
    });
    if (existingRole) {
      throw new Error('Role with this name already exists');
    }
    const role = await Role.create(roleData);
    return role;
  } catch (error) {
    logger.error(`Error creating role: ${error.message}`);
    throw new Error(`Error creating role: ${error.message}`);
  }
};

// Get all roles
const getAllRoles = async () => {
  try {
    const roles = await Role.findAll({
      order: [['RoleName', 'ASC']]
    });
    logger.info(`Received Roles data: ${JSON.stringify(roles)}`);
    return roles;
  } catch (error) {
    logger.error(`Error fetching roles: ${error.message}`);
    throw new Error(`Error fetching roles: ${error.message}`);
  }
};

// Get a role by ID
const getRoleById = async (id) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  } catch (error) {
    logger.error(`Error fetching role: ${error.message}`);
    throw new Error(`Error fetching role: ${error.message}`);
  }
};

// Update a role by ID
const updateRole = async (id, roleData) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (roleData.RoleName && roleData.RoleName !== role.RoleName) {
      const existingRole = await Role.findOne({
        where: {
          RoleName: roleData.RoleName,
          id: { [Op.ne]: id }
        }
      });
      if (existingRole) {
        throw new Error('Role with this name already exists');
      }
    }

    await role.update(roleData);
    return role;
  } catch (error) {
    logger.error(`Error updating role: ${error.message}`);
    throw new Error(`Error updating role: ${error.message}`);
  }
};

// Delete a role by ID
const deleteRole = async (id) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if any employees are using this role
    const employeesWithRole = await Employee.count({
      where: { RoleID: id }
    });

    if (employeesWithRole > 0) {
      throw new Error('Cannot delete role as it is assigned to employees');
    }

    await role.destroy();
    return { message: 'Role deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting role: ${error.message}`);
    throw new Error(`Error deleting role: ${error.message}`);
  }
};

// Search roles
const searchRoles = async (query) => {
  try {
    const roles = await Role.findAll({
      where: {
        [Op.or]: [
          { RoleName: { [Op.like]: `%${query}%` } },
          { Description: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['RoleName', 'ASC']]
    });
    return roles;
  } catch (error) {
    logger.error(`Error searching roles: ${error.message}`);
    throw new Error(`Error searching roles: ${error.message}`);
  }
};

// Get role employees
const getRoleEmployees = async (id) => {
  try {
    const role = await Role.findByPk(id, {
      include: [{
        model: Employee,
        as: 'Employees'
      }]
    });
    if (!role) {
      throw new Error('Role not found');
    }
    return role.Employees;
  } catch (error) {
    logger.error(`Error fetching role employees: ${error.message}`);
    throw new Error(`Error fetching role employees: ${error.message}`);
  }
};

const roleService = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  searchRoles,
  getRoleEmployees
};

module.exports = roleService;
