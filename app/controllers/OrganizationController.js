const Organization = require('../models/Organization');
const { validationResult } = require('express-validator');

const OrganizationController = {

    createOrganization: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { name } = req.body;
            const organization = new Organization({ name });
            const savedOrganization = await organization.save();
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
            const organizations = await Organization.find();
            res.status(200).json(organizations);
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