const express = require('express');
const router = express.Router();
const surveyController = require('../app/controllers/SurveyController');

// Create Survey with Survey Members
router.post('/create', surveyController.createSurvey);
router.get('/', surveyController.getSurveyById);
router.get('/all-survey', surveyController.getAllSurvey);

router.get('/participants', surveyController.getSurveyParticipantsById);
router.delete('/participants/:id', surveyController.deleteParticipant);
router.post('/participants/create', surveyController.createSurveyParticipants);





module.exports = router;