const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        unique: true
    },
    parent_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null 
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true }); // This will automatically add `createdAt` and `updatedAt` fields

// Check if the model already exists before defining it
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

module.exports = Category;