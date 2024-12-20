// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../app/controllers/CategoryController');

// Create a new category
router.post('/create', CategoryController.createCategory);

// Get all categories
router.get('/', CategoryController.getCategories);

// Get a category by ID
router.get('/:id', CategoryController.getCategoryById);
router.get('/get-category-orgid/:id', CategoryController.getCategoryByOrgId);


// Update a category by ID
router.put('/:id', CategoryController.updateCategory);

// Delete a category by ID
router.delete('/:id', CategoryController.deleteCategory);
router.get('/:categoryId/subcategories', CategoryController.getSubcategoriesByCategoryId);


module.exports = router;