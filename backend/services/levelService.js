const { Op } = require('sequelize');
const Level = require('../models/levelModel');
const Employee = require('../models/employeeModel');

const levelService = {
  async getAllLevels() {
    try {
      const levels = await Level.findAll({
        order: [['LevelName', 'ASC']]
      });
      return levels;
    } catch (error) {
      throw new Error('Error fetching levels: ' + error.message);
    }
  },

  async createLevel(levelData) {
    try {
      // Check for existing level name
      const existingLevel = await Level.findOne({
        where: { LevelName: levelData.LevelName }
      });

      if (existingLevel) {
        throw new Error('Level name already exists');
      }

      const level = await Level.create(levelData);
      return level;
    } catch (error) {
      throw new Error('Error creating level: ' + error.message);
    }
  },

  async updateLevel(id, levelData) {
    try {
      const level = await Level.findByPk(id);
      if (!level) {
        throw new Error('Level not found');
      }

      // Check for duplicate level name if it's being changed
      if (levelData.LevelName && levelData.LevelName !== level.LevelName) {
        const existingLevel = await Level.findOne({
          where: {
            LevelName: levelData.LevelName,
            id: { [Op.ne]: id }
          }
        });

        if (existingLevel) {
          throw new Error('Level name already exists');
        }
      }

      await level.update(levelData);
      return level;
    } catch (error) {
      throw new Error('Error updating level: ' + error.message);
    }
  },

  async deleteLevel(id) {
    try {
      const level = await Level.findByPk(id);
      if (!level) {
        throw new Error('Level not found');
      }

      // Check if level is in use by any employees
      const employeesWithLevel = await Employee.findOne({
        where: { LevelID: id }
      });

      if (employeesWithLevel) {
        throw new Error('Cannot delete level as it is assigned to one or more employees');
      }

      await level.destroy();
      return { message: 'Level deleted successfully' };
    } catch (error) {
      throw new Error('Error deleting level: ' + error.message);
    }
  }
};

module.exports = levelService;
