const express = require('express');
const router = express.Router();
const surveyController = require('../app/controllers/SurveyController');
const SurveyAnswersController = require('../app/controllers/SurveyAnswersController');

// Create Survey with Survey Members
router.post('/create', surveyController.createSurvey);
router.get('/', surveyController.getSurveyById);
router.get('/all-survey', surveyController.getAllSurvey);

router.get('/participants', surveyController.getSurveyParticipantsById);
router.delete('/participants/:id', surveyController.deleteParticipant);
router.post('/participants/create', surveyController.createSurveyParticipants);

router.post('/answers/create', SurveyAnswersController.saveSurveyAnswers);
router.get('/answers/:survey_id', SurveyAnswersController.getSurveyAnswersBySurveyId);
router.get('/participants/invited/:survey_id', SurveyAnswersController.getTotalParticipantsInvited);
router.get('/generate-report/:survey_id', surveyController.generateSurveyReport);
router.get('/generate-competency-average/:survey_id', surveyController.generateCompetencyAverageReport);







module.exports = router;