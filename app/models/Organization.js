const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], // You can adjust the values based on your needs
        default: 'active'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Organization', OrganizationSchema);