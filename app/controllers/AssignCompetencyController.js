const AssignCompetency = require('../models/AssignCompetencyModel');

// Create a new assignment
exports.createAssignment = async (req, res) => {
    try {
        const { type, organization_id, user_id, category_id, subcategories = [] } = req.body;

        // Create an array to hold the new assignments
        const newAssignments = [];

        // Prepare the main category assignment
        newAssignments.push({
            type,
            user_id,
            organization_id,
            category_id, // Use provided category_id directly
            status: 'active', // Default status or modify as needed
        });

        // Add assignments for each subcategory
        newAssignments.push(...subcategories.map(subcategoryId => ({
            type,
            user_id,
            organization_id,
            category_id: subcategoryId, // Use subcategory ID as category_id
            status: 'active', // Default status or modify as needed
        })));

        // Check for existing assignments to avoid duplication
        const existingAssignments = await AssignCompetency.find({
            organization_id,
            user_id,
            type,
            category_id: { $in: [...subcategories, category_id] } // Check against all provided IDs
        });

        // Create a set of existing IDs to avoid duplication
        const existingCategoryIds = new Set(existingAssignments.map(a => a.category_id.toString()));

        // Filter out assignments that already exist
        const filteredAssignments = newAssignments.filter(a => !existingCategoryIds.has(a.category_id.toString()));

        if (filteredAssignments.length === 0) {
            return res.status(400).json({ error: 'No new categories to add' });
        }

        // Save all new assignments to the database
        const savedAssignments = await AssignCompetency.insertMany(filteredAssignments);

        res.status(201).json(savedAssignments);
    } catch (error) {
        console.error('Error creating assignments:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await AssignCompetency.find()
            .populate('user_id', 'name') // Adjust fields as needed
            .populate('organization_id', 'name')
            .populate('question_id', 'text')
            .populate('category_id', 'name');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single assignment by ID
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await AssignCompetency.findById(req.params.id)
            .populate('user_id', 'name')
            .populate('organization_id', 'name')
            .populate('question_id', 'text')
            .populate('category_id', 'name');
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an assignment by ID
exports.updateAssignment = async (req, res) => {
    try {
        const updatedAssignment = await AssignCompetency.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an assignment by ID
exports.deleteAssignment = async (req, res) => {
    try {
        const deletedAssignment = await AssignCompetency.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.getAssignmentsByUserAndOrg = async (req, res) => {
    try {
        const { user_id, organization_id } = req.params; // Get user_id and organization_id from query parameters

        if (!user_id || !organization_id) {
            return res.status(400).json({ error: 'user_id and organization_id are required' });
        }

        // Fetch assignments based on user_id and organization_id
        const assignments = await AssignCompetency.find({
            user_id,
            organization_id
        })
        .populate({
            path: 'organization_id',
            select: 'name', // Exclude the __v field from the populated organization documents
        })
        .populate('user_id', 'username')
        .populate('question_id', 'questionText')
        .populate('category_id', 'category_name parent_id',);

        if (assignments.length === 0) {
            return res.status(404).json({ message: 'No assignments found for the given user and organization' });
        }

        res.status(200).json({ assignments: assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: error.message });
    }
};