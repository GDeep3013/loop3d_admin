const mongoose = require('mongoose');

const surveyMemberSchema = new mongoose.Schema({
    participant_last: {
        type: String,
        required: true
    },
    participant_first: {
        type: String,
        required: true
    },
    participant_email: {
        type: String,
        required: true
    },
    participant_relationship: {
        type: String,
        required: true
    },
    survey_status: {
        type: String,
        enum: ['pending', 'completed', 'in_progress'],
        default: 'pending'
    },
    participant_id: {
        type: String,
        required: true
    },
    survey_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    }
}, {
    timestamps: true
});

const SurveyMember = mongoose.model('SurveyMember', surveyMemberSchema);
module.exports = SurveyMember;
