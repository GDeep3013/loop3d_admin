// models/SurveyAnswers.js
const mongoose = require('mongoose');

const SurveyAnswersSchema = new mongoose.Schema({
    survey_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
    },
    participant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SurveyParticipant',
        required: true,
    },
    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
                required: true,
            },
            optionId: {
                type: mongoose.Schema.Types.ObjectId,
                required: false, // Only required for multiple-choice questions
            },
            answer: {
                type: String,
                required: false, // Only required for text-based questions
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('SurveyAnswers', SurveyAnswersSchema);
