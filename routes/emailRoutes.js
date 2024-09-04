// routes/emailRoutes.js
const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const emailController = require('../app/controllers/EmailController');

// Create an email with validation
router.post('/create', emailController.createEmail);

// Update an email with validation
router.put('/:id', emailController.updateEmail);

// Get all emails
router.get('/', emailController.getEmails);

// Get an email by ID
router.get('/:id', emailController.getEmailById);

// Delete an email
router.delete('/:id', emailController.deleteEmail);

module.exports = router;
