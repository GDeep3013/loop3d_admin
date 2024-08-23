const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    category_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to Category
    sub_category_name: { type: String, required: true },
}, { timestamps: true });

const SubCategory = mongoose.model('SubCategory', subcategorySchema); 

module.exports = SubCategory;