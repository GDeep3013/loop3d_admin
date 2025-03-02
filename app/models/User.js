const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String , default: null, required: false },
    password: { type: String,default: null},
    email: { type: String, unique: true, required: true },
    resetPasswordToken: { type: String },   
    resetPasswordExpires: { type: String },  
    title:{type: String},
    phone:{type: String},
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
