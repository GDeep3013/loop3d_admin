const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
    name: {
        type: String,
        default: null 
    },
    loop_lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        default: null
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', // Assuming you have a User model
    },
    report_gen_date: {
        type: Date,
        default: null
    },
    total_invites: {
        type: Number,
        default: 0
    },
    survey_status: {
        type: String,
        enum: ['pending', 'completed', 'in_progress'],
        default: 'pending'

    },
    ll_survey_status: {
        type: String,
        enum: ['yes', 'no'],
        default: "no"

    },
    mgr_survey_status: {
        type: String,
        enum: ['yes', 'no'],
        default: "no"
    },
    competencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] // Add competencies field

 },{
        timestamps: true
});

const Survey = mongoose.model('Survey', SurveySchema);

module.exports = Survey;