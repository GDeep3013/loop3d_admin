const Category = require('../models/Category.js');
const SubCategory = require('../models/SubCategory.js');

const CategoryController = {
    createCategory: async (req, res) => {
    
        const { category_name, sub_category, category_id = null } = req.body;
        console.log(req.body,category_name, sub_category, category_id);
        try {
            if (!category_id) {
            
                const category = new Category({ category_name: category_name });
                if (await category.save()) {              
                    const subCategory = new SubCategory({ category_Id: category._id, sub_category_name: sub_category });
                    if (await subCategory.save()) {
                        return res.status(201).json({
                            message: 'Category and subcategory created successfully'
                        });
                    }
                }
            } else {
           const subCategory = new SubCategory({ category_Id: category_id, sub_category_name: sub_category });
                if (await subCategory.save()) {
                    return res.status(201).json({
                        message: 'Subcategory created successfully'
                    });
                }
            }
        } catch (error) {
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                for (const key in error.errors) {
                    validationErrors[key] = error.errors[key].message;
                }
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validationErrors,
                });
            }
            return res.status(500).json({ error: 'Server error', details: error.message });
        }
    },
    getCategory: async (req, res) => {
        try {
            // Find all categories
            const categories = await Category.find();

            // For each category, populate the subcategories
            const categoriesWithSubCategories = await Promise.all(
                categories.map(async (category) => {
                    const subCategories = await SubCategory.find({ category_Id: category._id }).select('sub_category_name');
                    return {
                        ...category._doc, 
                        subCategories, 
                    };
                })
            );

            res.status(200).json({ status: 'success', data: categoriesWithSubCategories });
        } catch (error) {
            console.error('Error fetching categories with subcategories:', error);
            res.status(500).json({ error: 'Server error', details: error.message });
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;           
            await SubCategory.deleteMany({ category_Id: id });
            const result = await Category.findByIdAndDelete(id);

            if (!result) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json({ message: 'Category and associated subcategories deleted successfully' });
        } catch (error) {
            console.error('Error deleting category and subcategories:', error);
            res.status(500).json({ error: 'Server error', details: error.message });
        }
    },
    getCategoryWithId: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            const subCategories = await SubCategory.find({ category_Id: id }).select('sub_category_name');

            res.status(200).json({
                ...category._doc, 
                subCategories, 
            });
        } catch (error) {
            console.error('Error fetching category and subcategories:', error);
            res.status(500).json({ error: 'Server error', details: error.message });
        }
    },


};

module.exports = CategoryController;
