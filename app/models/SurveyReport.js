const mongoose = require('mongoose');
const { Schema } = mongoose;
const SurveyReportSchema = new mongoose.Schema({
    survey_id: { type: String, unique: true, required: true },
    response_Data: { type: Schema.Types.Mixed, required: true },
    samrtgoals: { type: Schema.Types.Mixed },
    question_summary:{type: Schema.Types.Mixed },
    summary_video_id:{ type: String}
},
 {
    timestamps: true ,
})

const SurveyReport = mongoose.model('SurveyReport', SurveyReportSchema);

module.exports = SurveyReport;
