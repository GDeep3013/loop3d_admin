// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const QuestionController = require('../app/controllers/QuestionController');

router.post('/create', QuestionController.createQuestion);

router.get('/', QuestionController.getAllQuestions);

router.get('/:id', QuestionController.getQuestionById);

router.put('/:id', QuestionController.updateQuestion);

router.delete('/:id', QuestionController.deleteQuestion);


module.exports = router;