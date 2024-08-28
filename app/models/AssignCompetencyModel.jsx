const mongoose = require('mongoose');

const AssignCompetencySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', 
        default: null
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], // You can adjust the values based on your needs
        default: 'active'
    }
});

module.exports = mongoose.model('AssignCompetency', AssignCompetencySchema);