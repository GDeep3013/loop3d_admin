const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const UserController = require('../app/controllers/UserController'); // Adjust the path as needed



// Create an User
// router.post('/create', UserController.createUser);

// Get all Users
// router.get('/', UserController.fetchUsers);

// Get a specific User by ID
router.get('/:id', UserController.showUser);

// // Update an User
// router.put('/:id', UserController.updateUser);

// // Delete an User
// router.delete('/:id', UserController.deleteUsers);


router.get('/loop-leads/:org_id', UserController.getLoopLeads);
router.get('/loop-leads-user/:user_id/:org_id', UserController.getLoopLeadsUserByOrgId);


module.exports = router;
