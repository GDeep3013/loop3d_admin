
// models/Email.js
const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    recipient_type: {
        type: String,
        required: true
    },
    subject_line: {
        type: String,
        required: true
    },
    email_content: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Email', emailSchema);
