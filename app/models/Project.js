const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    projectDescription: { type: String, required: true },
    keyFeatures: { type: String,},
    skills: { type: [String], required: true },
    timelineMilestone: { type: [String] },
    budgetType: { type: String, enum: ['Fixed', 'Hourly'], required: true },
    budget: { type: Number, required: true },
    clientName: { type: String, required: true },
    clientLocation: { type: String},
    upWorkId: { type: String,required: true},
    submissionDeadline: { type: Date, },
    endDate: { type: Date, },
    teamMembers: { type: [String]},
    figmaLink: String,
    liveLink: String,
    githubLink: String,
    fileText: {type: [String]},
    otherFiles: { type: [String], default: [] }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
