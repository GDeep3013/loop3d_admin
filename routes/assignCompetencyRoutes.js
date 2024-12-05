const express = require('express');
const router = express.Router();
const AssignCompetencyController = require('../app/controllers/AssignCompetencyController');


// Route to create a new assignment
router.post('/assign', AssignCompetencyController.createAssignment);

// Route to get all assignments
router.get('/', AssignCompetencyController.getAllAssignments);
router.get('/assign', AssignCompetencyController.getAssignmentsByUserId);
router.get('/get-questions', AssignCompetencyController.getAssignmentById);



// Route to get a specific assignment by ID
router.get('/:id', AssignCompetencyController.getAssignmentById);

// Route to update an assignment by ID
router.put('/:id', AssignCompetencyController.updateAssignment);

// Route to delete an assignment by ID
router.delete('/assign/:id', AssignCompetencyController.deleteAssignment);
// router.get('/assign/:user_id', AssignCompetencyController.getAssignmentsByUserId);
router.get('/:id/:ref_id', AssignCompetencyController.getAssignmentsByUserAndOrg);



module.exports = router;
