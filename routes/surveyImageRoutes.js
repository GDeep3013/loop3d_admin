// routes/surveyImageRoutes.js
const express = require('express');
const router = express.Router();
const surveyImageController = require('../app/controllers/SurveyImageController');

// POST route to save the chart image
router.post('/save-chart-image', surveyImageController.saveChartImage);

// GET route to fetch all images for a survey
router.get('/chart-images/:survey_id', surveyImageController.getSurveyImages);

module.exports = router;