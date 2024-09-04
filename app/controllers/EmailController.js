// controllers/emailController.js
const Email = require('../models/Email');
const { validationResult } = require('express-validator');

// Create a new email
exports.createEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const email = new Email(req.body);
        await email.save();
        res.status(201).send(email);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Update an email
exports.updateEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const email = await Email.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!email) {
            return res.status(404).send();
        }
        res.send(email);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all emails
exports.getEmails = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;



        // Convert query params to integers (since they are initially strings)
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch emails with pagination
        const emails = await Email.find().sort({ _id: -1 }).skip(skip).limit(limit);

        // Fetch the total number of emails matching the query
        const totalEmails = await Email.countDocuments();

        // Calculate total number of pages
        const totalPages = Math.ceil(totalEmails / limit);

        // Respond with emails and pagination info
        res.status(200).json({
            emails,
            meta: {
                totalEmails,
                currentPage: page,
                totalPages,
                pageSize: limit,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get email by ID
exports.getEmailById = async (req, res) => {
    try {
        const email = await Email.findById(req.params.id);
        if (!email) {
            return res.status(404).send();
        }
        res.send(email);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Delete an email
exports.deleteEmail = async (req, res) => {
    try {
        const email = await Email.findByIdAndDelete(req.params.id);
        if (!email) {
            return res.status(404).send();
        }
        res.send({ message: 'Email deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};
