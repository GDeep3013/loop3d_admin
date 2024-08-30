const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
    name: {
        type: String,
        default: null 
    },
    loop_lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        default: null
    },
    mgr_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        default: null
    },
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', // Assuming you have a User model
        default: null
    },
    report_gen_date: {
        type: Date,
        default: null
    },
    total_invitees: {
        type: Number,
        default: null
    },
    survey_status: {
        type: String,
        enum: ['pending', 'completed', 'in_progress'],
        default: 'pending'

    },
    ll_completed_survey: {
        type: String,
        enum: ['yes', 'no'],
        default: "no"

    },
    mgr_completed_survey: {
        type: String,
        enum: ['yes', 'no'],
        default: "no"

    }


 },{
        timestamps: true
    });

const Survey = mongoose.model('Survey', SurveySchema);

module.exports = Survey;