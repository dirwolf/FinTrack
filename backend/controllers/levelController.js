const levelService = require('../services/levelService');
const logger = require('../utils/logger');

const levelController = {
  async getAllLevels(req, res) {
    try {
      const levels = await levelService.getAllLevels();
      res.json(levels);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getLevelById(req, res) {
    try {
      const level = await levelService.getLevelById(req.params.levelId);
      res.json(level);
    } catch (error) {
      if (error.message === 'Level not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async createLevel(req, res) {
    try {
      const level = await levelService.createLevel(req.body);
      res.status(201).json(level);
    } catch (error) {
      if (error.message === 'Level name already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async updateLevel(req, res) {
    try {
      const level = await levelService.updateLevel(req.params.levelId, req.body);
      res.json(level);
    } catch (error) {
      if (error.message === 'Level not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Level name already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  async deleteLevel(req, res) {
    try {
      const result = await levelService.deleteLevel(req.params.levelId);
      res.json(result);
    } catch (error) {
      if (error.message === 'Level not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Cannot delete level as it is assigned to one or more employees') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async searchLevels(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const levels = await levelService.searchLevels(query);
      res.json(levels);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getLevelEmployees(req, res) {
    try {
      const { levelId } = req.params;
      if (!levelId) {
        return res.status(400).json({ error: 'Level ID is required' });
      }
      const employees = await levelService.getLevelEmployees(levelId);
      res.json(employees);
    } catch (error) {
      if (error.message === 'Level not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
};

module.exports = levelController;
