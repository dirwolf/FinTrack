const Organisation = require('../models/organisationModel');
const logger = require('../utils/logger');

const createOrganisation = async (organisationData) => {
  try {
    const organisation = await Organisation.create(organisationData);
    return organisation;
  } catch (error) {
    logger.error(`Error creating organisation: ${error.message}`);
    throw new Error(`Error creating organisation: ${error.message}`);
  }
};

const getAllOrganisations = async () => {
  try {
    const organisations = await Organisation.findAll();
    return organisations;
  } catch (error) {
    logger.error(`Error fetching organisations: ${error.message}`);
    throw new Error(`Error fetching organisations: ${error.message}`);
  }
};

const updateOrganisation = async (organisationId, updates) => {
  try {
    const organisation = await Organisation.findByPk(organisationId);
    if (!organisation) {
      throw new Error(`Organisation with id ${organisationId} not found`);
    }
    await organisation.update(updates);
    return organisation;
  } catch (error) {
    logger.error(`Error updating organisation: ${error.message}`);
    throw new Error(`Error updating organisation: ${error.message}`);
  }
};

const deleteOrganisation = async (organisationId) => {
  try {
    const organisation = await Organisation.findByPk(organisationId);
    if (!organisation) {
      throw new Error(`Organisation with id ${organisationId} not found`);
    }
    await organisation.destroy();
    return { message: 'Organisation deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting organisation: ${error.message}`);
    throw new Error(`Error deleting organisation: ${error.message}`);
  }
};

module.exports = {
  createOrganisation,
  getAllOrganisations,
  updateOrganisation,
  deleteOrganisation,
};
