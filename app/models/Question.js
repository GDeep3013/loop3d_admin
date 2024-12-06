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
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', // References the Organization model
        default:null,
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // References the Category model
        default:null,
    },
    parentType: {
        type: String,
        default:null,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null,// Assuming you have a User model
    },
    options: [OptionSchema]  // Array of options with references to the question ID
}, {
    timestamps: true
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;