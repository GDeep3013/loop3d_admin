const AssignCompetency = require('../models/AssignCompetencyModel');
const Category = require('../models/CategoryModel');
const User = require('../models/User');

// Create a new assignment
exports.createAssignment = async (req, res) => {
    try {
        const { action, type, ref_id, user_id, category_id} = req.body;
        let referenceIdField = '';

        // Determine the field for the reference ID based on the type
        if (type === 'question') {
            referenceIdField = 'question_id';
        } else if (type === 'organization') {
            referenceIdField = 'organization_id';
        }
        let newAssignments = [];
        if (action == 'assign') {
            newAssignments.push({
                type,
                user_id,
                [referenceIdField]: ref_id,
                category_id: category_id,
                status: 'active',
            });

            // Check for existing assignments to avoid duplication
            const existingAssignments = await AssignCompetency.find({
                [referenceIdField]: ref_id,
                user_id,
                category_id: { $in: category_id },
            });

            // Create a set of existing category IDs to filter out duplicates
            const existingCategoryIds = new Set(existingAssignments.map(a => a.category_id.toString()));

            // Filter out assignments that already exist
            const filteredAssignments = newAssignments.filter(a => !existingCategoryIds.has(a.category_id.toString()));

            // If no new assignments to add, return success
            if (filteredAssignments.length === 0) {
                return res.status(200).json({ message: 'All provided categories are already assigned' });
            }

            // Save all new assignments to the database
            const savedAssignments = await AssignCompetency.insertMany(filteredAssignments);

            return res.status(201).json(savedAssignments);
        } else if (action == 'unassign') {
             // Check the count of assigned competencies for the user
            const assignedCount = await AssignCompetency.countDocuments({
                user_id,
                [referenceIdField]: ref_id,
            });

            // Prevent unassignment if there are already less than 3 competencies assigned
            if (assignedCount <= 3) {
                return res.status(400).json({ message: 'You must keep at least 3 competencies assigned.' });
            }

            const result = await AssignCompetency.findOneAndDelete({
                user_id,
                [referenceIdField]: ref_id,
                category_id: category_id,
            });

            // Check if any documents were deleted
            if (result) {
                return res.status(200).json({ message: 'Competency unassigned successfully' });
            } else {
                return res.status(404).json({ message: 'No assignments found to remove' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid action. Use either "assign" or "unassign".' });
        }
    } catch (error) {
        console.error('Error handling assignment:', error);
        res.status(500).json({ error: error.message });
    }
};



// Get all assignments
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await AssignCompetency.find()
            .populate('user_id', 'first_name last_name') // Adjust fields as needed
            .populate('organization_id', 'name')
            .populate('question_id', 'text')
            .populate('category_id', 'name category_name status');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single assignment by ID
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await AssignCompetency.findById(req.params.id)
            .populate('user_id', 'first_name last_name')
            .populate('organization_id', 'name')
            .populate('question_id', 'text')
            .populate('category_id', 'category_name competency_type status');
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
        // Fetch all subcategories of the given category

        // Delete the specific assignment
        const deletedAssignment = await AssignCompetency.findByIdAndDelete(req.params.id);

        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }    

        res.status(200).json({ status: true, message: 'Assignment and related subcategory assignments deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.getAssignmentsByUserAndOrg = async (req, res) => {
    try {
        const { id, ref_id, } = req.params; // Get user_id and organization_id from query parameters

        if (!id || !ref_id) {
            return res.status(400).json({ error: 'user_id and organization_id are required' });
        }

        let referenceIdField = '';
        if (req.query.type === 'question') {
            referenceIdField = 'question_id';
        } else if (req.query.type === 'organization') {
            referenceIdField = 'organization_id';
        }
        // Fetch assignments based on user_id and organization_id
        const assignments = await AssignCompetency.find({
            user_id:id,
            [referenceIdField]: ref_id,
        })
        .populate({
            path: 'organization_id',
            select: 'name', // Exclude the __v field from the populated organization documents
        })
        .populate('user_id', 'first_name last_name')
        .populate('question_id', 'questionText')
        .populate('category_id', 'category_name competency_type status',);

        if (assignments.length === 0) {
            return res.status(404).json({ message: 'No assignments found for the given user and organization' });
        }

        res.status(200).json({ assignments: assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.getAssignmentsByUserId = async (req, res) => {
    try {
        const { user_id, search } = req.query; // Get user_id and search from query parameters

        if (!user_id) {
            return res.status(400).json({ error: 'User id is required' });
        }

        // Fetch the user to get the organization_id
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch assignments based on user_id and organization_id
        let assignments = await AssignCompetency.find({ organization_id: user.organization })
            .populate({
                path: 'organization_id',
                select: 'name', // Include the organization name only
            })
            .populate('question_id', 'questionText')
            .populate('category_id', 'category_name competency_type status');

        // Filter assignments by competency_type if search parameter is provided
        if (search) {
            assignments = assignments.filter(assignment => 
                assignment.category_id && 
                assignment.category_id.competency_type === search
            );
        }

        if (assignments.length === 0) {
            return res.status(404).json({ message: 'No assignments found for the given criteria' });
        }



        res.status(200).json({ assignments: assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: error.message });
    }
};