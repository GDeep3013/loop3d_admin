const Question = require('../models/Question');

// Function to create a new question
exports.createQuestion = async (req, res) => {
    try {
        // Extract question data from the request body
        const { questionText, type, options } = req.body;

        // Create a new question instance
        const newQuestion = new Question({
            type,
            questionText,
            options: []  // Start with an empty options array
        });

        // Save the question to the database first
        await newQuestion.save();

        // Update the options with the questionId
        newQuestion.options = options.map(option => ({
            ...option,
            questionId: newQuestion._id  // Set the questionId for each option
        }));

        // Save the updated question with options
        await newQuestion.save();

        // Send a response back to the client
        res.status(201).json(newQuestion);
    } catch (err) {
        // Handle errors
        res.status(400).json({ error: err.message });
    }
};

// Function to get all questions
exports.getAllQuestions = async (req, res) => {
    try {
        // Extract query parameters for pagination
        let { page = 1, limit = 10 } = req.query;

        // Convert query params to integers (since they are initially strings)
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch categories with pagination
        const questions = await Question.find().skip(skip).limit(limit)

        // Fetch the total number of categories
        const totalQuestion = await Question.countDocuments();

        // Calculate total number of pages
        const totalPages = Math.ceil(totalQuestion / limit);

        // Respond with categories and pagination info
        res.status(200).json({
            questions,
            meta: {
                totalQuestion,
                currentPage: page,
                totalPages,
                pageSize: limit,
            },
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Function to get a question by ID
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Function to update a question
exports.updateQuestion = async (req, res) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(updatedQuestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Function to delete a question
exports.deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};