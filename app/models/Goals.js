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
    survey_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
    },
    competency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Assuming you have a User model
        required: true
    },   
    goal_apply: { // Add this field to the schema
        type: String,
      
    },
    goal_result_seen: { // Add this field to the schema
        type: String,
      
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