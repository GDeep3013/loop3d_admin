// controllers/categoryController.js
const Category = require('../models/categoryModel');

// Create a new category
const CategoryController = {

    createCategory : async (req, res) => {
        try {
            console.log(req.body);

            const { category_name, parent_id, created_by, status } = req.body;

            const newCategory = new Category({
                category_name,
                parent_id,
                created_by,
                status
            });

            const savedCategory = await newCategory.save();
            res.status(201).json(savedCategory);

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Get all categories
    getCategories: async (req, res) => {
        try {
            // Extract query parameters for pagination
            let { page = 1, limit = 10, getType = null  } = req.query;

            // Convert query params to integers (since they are initially strings)
            page = parseInt(page, 10);
            limit = parseInt(limit, 10);

            // Calculate the number of documents to skip
            const skip = (page - 1) * limit;

            // Fetch categories with pagination
            let categories = [];
            if (getType == "AssignCompetency") {
                categories = await Category.find({ parent_id: null }).populate('parent_id', 'category_name');
            } else {
               categories = await Category.find().skip(skip).limit(limit).populate('parent_id', 'category_name');        

            }

            // Fetch the total number of categories
            const totalCategories = await Category.countDocuments();

            // Calculate total number of pages
            const totalPages = Math.ceil(totalCategories / limit);

            // Respond with categories and pagination info
            res.status(200).json({
                categories,
                meta: {
                    totalCategories,
                    currentPage: page,
                    totalPages,
                    pageSize: limit,
                },
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Get a category by ID
    getCategoryById : async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }
            res.status(200).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Update a category by ID
    updateCategory : async (req, res) => {
        try {
            const { category_name, parent_id, status } = req.body;

            const updatedCategory = await Category.findByIdAndUpdate(
                req.params.id,
                { category_name, parent_id, status },
                { new: true, runValidators: true }
            );

            if (!updatedCategory) {
                return res.status(404).json({ error: "Category not found" });
            }

            res.status(200).json(updatedCategory);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getSubcategoriesByCategoryId : async (req, res) => {
        try {
            const { categoryId } = req.params;
            const subcategories = await Category.find({ parent_id: categoryId });
            res.json({ subcategories });
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Delete a category by ID
    deleteCategory : async (req, res) => {
        try {
            const deletedCategory = await Category.findByIdAndDelete(req.params.id);
            if (!deletedCategory) {
                return res.status(404).json({ error: "Category not found" });
            }
            res.status(200).json({ message: "Category deleted successfully" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = CategoryController;