const express = require('express');
const router = express.Router();
const AssignCompetencyController = require('../app/controllers/AssignCompetencyController');


// Route to create a new assignment
router.post('/', AssignCompetencyController.createAssignment);

// Route to get all assignments
router.get('/', AssignCompetencyController.getAllAssignments);

// Route to get a specific assignment by ID
router.get('/:id', AssignCompetencyController.getAssignmentById);

// Route to update an assignment by ID
router.put('/:id', AssignCompetencyController.updateAssignment);

// Route to delete an assignment by ID
router.delete('/:id', AssignCompetencyController.deleteAssignment);
router.get('/:user_id/:organization_id', AssignCompetencyController.getAssignmentsByUserAndOrg);


module.exports = router;
