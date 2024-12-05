// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const QuestionController = require('../app/controllers/QuestionController');
const ChatController = require('../app/controllers/ChatController');


router.post('/create', QuestionController.createQuestion);

router.get('/', QuestionController.getAllQuestions);
router.get('/get-openended-question', QuestionController.getOpenEndedQuestion);


router.get('/:id', QuestionController.getQuestionById);

router.put('/:id', QuestionController.updateQuestion);

router.delete('/:id', QuestionController.deleteQuestion);

router.post('/send-prompt', ChatController.sendPromptToChatGPT);


module.exports = router;