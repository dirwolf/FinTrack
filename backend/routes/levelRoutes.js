const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');

// Create a new level
router.post('/', levelController.createLevel);

// Get all levels
router.get('/', levelController.getAllLevels);

// Get level by ID
router.get('/:levelId', levelController.getLevelById);

// Update level by ID
router.put('/:levelId', levelController.updateLevel);

// Delete level by ID
router.delete('/:levelId', levelController.deleteLevel);

module.exports = router;
