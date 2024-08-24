const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const OrganizationController = require('../app/controllers/OrganizationController'); // Adjust the path as needed

// Validation rules for creating/updating an organization
const organizationValidation = [
    check('name').not().isEmpty().withMessage('Organization name is required')
];

// Create an organization
router.post('/create', organizationValidation, OrganizationController.createOrganization);

// Get all organizations
router.get('/', OrganizationController.getAllOrganizations);

// Get a specific organization by ID
router.get('/:id', OrganizationController.getOrganizationById);

// Update an organization
router.put('/:id', organizationValidation, OrganizationController.updateOrganization);

// Delete an organization
router.delete('/:id', OrganizationController.deleteOrganization);

module.exports = router;
