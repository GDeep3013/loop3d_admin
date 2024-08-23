const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    }},{
        timestamps: true
    });

const User = mongoose.model('Role', userSchema);

module.exports = User;
