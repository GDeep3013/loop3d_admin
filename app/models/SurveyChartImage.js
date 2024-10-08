const mongoose = require('mongoose');

const SurveyImageSchema = new mongoose.Schema({
    survey_id: {
        type: String,
        required: true,
    },
    chart_image: {
        type: String,
    },
    summaries_by_competency: {
        type: [Array],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SurveyChartImage', SurveyImageSchema);