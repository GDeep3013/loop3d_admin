const express = require('express');
const router = express.Router();
const surveyController = require('../app/controllers/SurveyController');

// Create Survey with Survey Members
router.post('/create', surveyController.createSurveyWithMembers);

module.exports = router;