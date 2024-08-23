const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    designation: { type: String, },
    skills: { type: [String] },   
    image: { type: String},
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }


}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
