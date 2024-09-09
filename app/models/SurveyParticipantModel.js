const mongoose = require('mongoose');

const SurveyParticipantSchema = new mongoose.Schema({
    p_first_name: {
        type: String,
        required: true
    },
    p_last_name: {
        type: String,
        required: true
    },
    p_email: {
        type: String,
        required: true
    },
    p_mag_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    survey_status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    p_type: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    survey_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    }
}, {
    timestamps: true
});

const SurveyParticipant = mongoose.model('SurveyParticipant', SurveyParticipantSchema);
module.exports = SurveyParticipant;