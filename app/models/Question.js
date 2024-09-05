const mongoose = require('mongoose');

// Define the Option schema with a questionId field
const OptionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    weightage: {
        type: Number,
        default: 1
    }
});

// Define the Question schema
const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Active"  // Set default value to true
    },
    questionType: {
        type: String,
        required: true // Ensure the question type is required
    },
    options: [OptionSchema]  // Array of options with references to the question ID
}, {
    timestamps: true
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;