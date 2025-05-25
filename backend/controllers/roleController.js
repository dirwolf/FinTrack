const roleService = require('../services/roleService');
const logger = require('../utils/logger');

// Controller methods to interact with the role service

// Create a role
const createRole = async (req, res) => {
  try {
    logger.info('Create role service called');
    const role = await roleService.createRole(req.body);
    return res.status(201).json(role);
  } catch (error) {
    logger.error(`Error creating role: ${error.message}`);
    if (error.message === 'Role with this name already exists') {
      return res.status(409).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
  }
};

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    logger.info('Get all roles service called');
    const roles = await roleService.getAllRoles();
    return res.status(200).json(roles); // Return all roles
  } catch (error) {
    logger.error(`Error fetching roles: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Delete a role by ID
const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    logger.info(`Delete role service called for roleId: ${roleId}`);
    const result = await roleService.deleteRole(roleId);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error deleting role: ${error.message}`);
    if (error.message === 'Role not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'Cannot delete role as it is assigned to employees') {
      return res.status(409).json({ error: error.message });
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
};


// Update role
const updateRole = async (req, res) => {
  try {
    logger.info(`Update role service called for roleId: ${req.params.roleId}`);
    const role = await roleService.updateRole(req.params.roleId, req.body);
    res.json(role);
  } catch (error) {
    logger.error(`Error updating role: ${error.message}`);
    if (error.message === 'Role not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Role name already exists') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;
    logger.info(`Get role by ID service called for roleId: ${roleId}`);
    const role = await roleService.getRoleById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    return res.status(200).json(role);
  } catch (error) {
    logger.error(`Error fetching role by ID: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

const roleController = {
  getAllRoles,
  createRole,
  deleteRole,
  updateRole,
  getRoleById
};

module.exports = roleController;
