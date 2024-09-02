const express = require('express');
const router = express.Router();
const surveyController = require('../app/controllers/SurveyController');

// Create Survey with Survey Members
router.post('/create', surveyController.createSurveyWithMembers);
router.get('/', surveyController.getSurveyById);
router.get('/all-survey', surveyController.getAllSurvey);

router.get('/participants', surveyController.getSurveyParticipantsById);
router.delete('/participants/:id', surveyController.deleteParticipant);




module.exports = router;