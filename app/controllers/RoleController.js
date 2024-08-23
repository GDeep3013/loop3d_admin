const Role = require('../models/Role.js');
const bcrypt = require('bcrypt');

const RoleController = {
    createRole: async (req, res) => {
        const { type } = req.body;
        try {
            const role = new Role({ type });
            if (await role.save()) {
                res.status(201).json({
                    message: 'Role created successfully'
                });
            }
        } catch (error) {
            
            if (error.name == "ValidationError") {
                const validationErrors = {};
                for (const key in error.errors) {
                    validationErrors[key] = error.errors[key].message;
                }
                res.status(400).json({
                    error: 'User validation failed',
                    details: validationErrors,
                });
            }
        }

    },
    fetchRole: async (req, res) => {
        try {
            const roles = await Role.find({});
            res.status(200).json({
                status: 'success',
                roles: roles
            });
        } catch (error) {
            console.error('Error retrieving roles:', error);
            res.status(500).json({
                error: 'Internal Server Error'
            });
        }
    }
}

module.exports = RoleController;
