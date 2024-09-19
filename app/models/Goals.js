const mongoose = require('mongoose');

const goalSehema = new mongoose.Schema({
    specific_goal: {
        type: String,
        required: true
    },
    dead_line: {
        type: String,
        required: true
    },
    competency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryModel', // Assuming you have a User model
        required: true
    },
    goal_apply: {
        type: String,
        required: true
    },
    goal_result: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Complete', 'Not Started', 'Started'],
        default: 'Not Started'
    },
    marked_as: {
        type: String
    }
}, { timestamps: true });

const Goals = mongoose.model('Goals', goalSehema);

module.exports = Goals;