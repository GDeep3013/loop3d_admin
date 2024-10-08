const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const GoalController = require('../app/controllers/GoalController'); // Adjust the path as needed

router.post('/create', GoalController.createGoals);

router.get('/get-goal/:survey_id', GoalController.getAllGoals);

router.post('/generate-plans', GoalController.generatePlans)

router.post('/save-plans', GoalController.savePlans)

router.delete('/delete/:id',GoalController.deletePlans)

router.put('/update/:id', GoalController.updateGoal);

router.get('/get-category/:surveyId', GoalController.getCategoriesByOrg);

module.exports = router;