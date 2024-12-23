const Organization = require('../models/Organization');
const { validationResult } = require('express-validator');
const AssignCompetency = require('../models/AssignCompetencyModel');
const Question = require('../models/Question')
const Category = require('../models/CategoryModel');

const addQuestions = async (organization_id) => {
    try {
        // Step 1: Get all categories with org_id null and clone them
        const categories = await Category.find({ organization_id: null }); // Get categories where org_id is null
        
        // Create a mapping of old category name to the cloned category
        const clonedCategories = [];

        // Iterate over each category
        for (const category of categories) {
            const clonedCategory = new Category({
                category_name: category.category_name,
                competency_type: category.competency_type,
                created_by: category.created_by,
                status: category.status,
                organization_id: organization_id,  // Assign new org_id
            });

            // Save cloned category
            const savedCategory = await clonedCategory.save();
            clonedCategories.push(savedCategory); // Save the reference of the cloned category

            // Step 2: Clone all associated questions for this category
            const questions = await Question.find({ category_id: category._id, questionType:"Radio", organization_id: null  });
            
            // Iterate over each question
            for (const question of questions) {
                const clonedQuestion = new Question({
                    questionType: question.questionType,
                    questionText: question.questionText,
                    options: question.options,
                    category_id: savedCategory._id,  // Use the cloned category ID
                    organization_id: organization_id,  // Assign new org_id
                    status: 'active',
                });

                // Save cloned question
                await clonedQuestion.save();
            }
        }

        const OpenEndeds = await Question.find({
            category_id: null,
            questionType: "OpenEnded",
            organization_id: null,
            parentType: { $ne: null }  // Correct usage of $ne operator for parentType
        });
        
        for (const question2 of OpenEndeds) {
            const clonedQuestion = new Question({
                questionType: question2.questionType,
                questionText: question2.questionText,
                parentType: question2.parentType,
                organization_id: organization_id,  // Assign new org_id
                status: 'active',
            });
        
            // Save cloned question
            await clonedQuestion.save();
        }
        // Return the list of cloned categories
        return clonedCategories;
    } catch (error) {
        console.error('Error cloning categories and questions:', error);
        throw new Error('Failed to clone categories and questions.');
    }
};
const OrganizationController = {
  
    createOrganization: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { name ,selectedCompetency,user_id } = req.body;
            const organization = new Organization({ name });
            const savedOrganization = await organization.save();
            if (savedOrganization?._id) {
                const clonedCategories = await addQuestions(savedOrganization?._id); // Clone categories and questions

                for (let competency of selectedCompetency) {
                    const newAssignments = [];
                    const category1 = await Category.findById(competency);
                    const matchedCategory = clonedCategories.find(
                        (category) => category.category_name == category1.category_name // Match by category name
                    );

                    if (!matchedCategory) {
                        console.log(`No cloned category found for: ${competency}`);
                        continue; // Skip if no match found
                    }

                    console.log('matchedCategory',matchedCategory)
                    // Prepare the main category assignment
                    newAssignments.push({
                        user_id,
                        organization_id: savedOrganization._id,
                        category_id: matchedCategory._id, // Assuming value holds the category ID
                        status: 'active', // Set default status
                    });
    
                    // Check for existing assignments to avoid duplication
                    const existingAssignments = await AssignCompetency.find({
                        organization_id: savedOrganization._id,
                        user_id,
                        category_id: matchedCategory._id, // Match the selected competency's category ID
                    });
    
                    // If there are existing assignments, skip to next competency
                    if (existingAssignments.length > 0) {
                        continue;
                    }
    
                    // Save new assignment
                    await AssignCompetency.insertMany(newAssignments);
                    // await addQuestions(savedOrganization?._id)

                }
            }
            res.status(201).json(savedOrganization);
        } catch (error) {
            // Check for duplicate key error (code 11000)
            if (error.code === 11000) {
                return res.status(400).json({ error: 'Organization name already exists' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getAllOrganizations: async (req, res) => {
        try {
            // Get 'page' and 'limit' from query parameters with default values
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 10; // Default to 10 results per page

            // Calculate the number of documents to skip
            const skip = (page - 1) * limit;
            let searchTerm = req.query.searchTerm
            const query = {};
            if (searchTerm) {
                query.$or = [
                    { name: { $regex: searchTerm, $options: 'i' } }
                ];
            }
            // Query the database with pagination
            let organizations = [];
            if (req.query.sortField && req.query.sortOrder) {
                
                const order = req.query.sortOrder === 'asc' ? 1 : -1;
                organizations = await Organization.find(query).sort({ [req.query.sortField]: order }).skip(skip).limit(limit);  
            } else {
                organizations = await Organization.find(query).sort({ _id: -1 }).skip(skip).limit(limit);
            }

            // Get the total count of documents in the collection
            const totalOrganizations = await Organization.countDocuments();

            // Calculate total pages
            const totalPages = Math.ceil(totalOrganizations / limit);

            // Send the response with the organizations and pagination info
            res.status(200).json({
                status:"success",
                data: organizations,
                currentPage: page,
                totalPages,
                totalOrganizations
            });
            
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getOrganizationById: async (req, res) => {
        try {
            const organization = await Organization.findById(req.params.id);
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.status(200).json(organization);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateOrganization: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name } = req.body;

            const updatedOrganization = await Organization.findByIdAndUpdate(
                req.params.id,
                { name },
                { new: true, runValidators: true }
            );

            if (!updatedOrganization) {
                return res.status(404).json({ error: 'Organization not found' });
            }

            res.status(200).json(updatedOrganization);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deleteOrganization: async (req, res) => {
        try {
            const deletedOrganization = await Organization.findByIdAndDelete(req.params.id);
            if (!deletedOrganization) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.status(200).json({ message: 'Organization deleted successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = OrganizationController;