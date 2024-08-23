const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category_name: { type: String, unique: true, required: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema); 

module.exports = Category;
