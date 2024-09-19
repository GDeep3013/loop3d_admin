const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const GoalController = require('../app/controllers/GoalController'); // Adjust the path as needed

router.post('/create', GoalController.createGoals);

router.get('/', GoalController.getAllGoals);

module.exports = router;