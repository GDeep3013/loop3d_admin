const Question = require('../models/Question');
const AssignCompetency = require('../models/AssignCompetencyModel');

// Function to create a new question
exports.createQuestion = async (req, res) => {
    try {
        // Extract question data from the request body

        const { questionText, questionType, options, currentCategoryId, createdBy, organization_id, parentType } = req.body;

        // Case 1: When parentType is null, undefined, or an empty string, check for existing question without parentType
        const query = {
            questionText,
            category_id: currentCategoryId,
            organization_id
        };

        // If parentType is provided, we add it to the query
        if (parentType !== null && parentType !== undefined && parentType !== '') {
            query.parentType = parentType;
            query.category_id=null
        }

    // Check if a question with the same text, organization, and (optional) parentType already exists
    const existingQuestion = await Question.findOne(query);

 

        if (existingQuestion) {
            return res.status(400).json({
                error: 'A question with the same text already exists'
            });
        }

        // Create a new question instance
        const newQuestion = new Question({
            questionText,
            questionType,
            options: [],  // Start with an empty options array
            category_id: currentCategoryId,
            organization_id,
            parentType
        });

        // Save the question to the database first
        await newQuestion.save();

        if (questionType = "Radio") {
            // Map options to include questionId and save them to the question
            newQuestion.options = options && options.map(option => ({
                ...option,
                questionId: newQuestion._id  // Set the questionId for each option
            }));

            // Save the updated question with options
            await newQuestion.save();
        }
        // Ensure the category ID and organization ID are present
        if (organization_id && newQuestion) {
            // Create the new assignment
            const newAssignment = {
                user_id: createdBy,
                question_id: newQuestion._id,
                category_id: currentCategoryId?currentCategoryId:null,
                organization_id,
                status: 'active',
            };

            // Check for existing assignments to avoid duplication
            const existingAssignment = await AssignCompetency.findOne({
                question_id: newQuestion._id,
                user_id: createdBy,
                category_id: currentCategoryId,
                organization_id,
            });

            // If no existing assignment, save the new one
            if (!existingAssignment) {
                const newa= await AssignCompetency.create(newAssignment);
                console.log('newAssignmentnewa',newa)
            }
        }

        // Send a response back to the client with the created question
        res.status(201).json(newQuestion);
    } catch (err) {
        // Handle errors and send a failure response
        res.status(400).json({ error: err.message });
    }
};

// Function to get all questions
exports.getAllQuestions = async (req, res) => {
    try {
        // Extract query parameters for pagination
        let { page = 1, limit = 10, searchTerm } = req.query;
        const query = { organization_id: null,category_id:null};

        // Add search functionality
        if (searchTerm) {
            query.$or = [
                { questionText: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Convert query params to integers (since they are strings by default)
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Calculate the number of documents to skip
        const skip = (page-1) * limit;

        // Fetch questions with pagination and populate the options field
        const questions = await Question.find(query)
            .populate('options') // Adjust the field if your schema uses a different reference
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        // Fetch the total number of questions matching the query
        const totalQuestions = await Question.countDocuments(query);

        // Calculate total number of pages
        const totalPages = Math.ceil(totalQuestions / limit);

        // Respond with questions and pagination info
        res.status(200).json({
            questions,
            meta: {
                totalQuestions,
                currentPage: page,
                totalPages,
                pageSize: limit,
            },
        });
    } catch (error) {
        // Return error response if an error occurs
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
        console.log(req.params.id, req.body);
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id?req.params.id: req.body?._id, req.body, { new: true, runValidators: true });
        if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(updatedQuestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

    exports.getOpenEndedQuestion = async (req, res) => {
        try {
            const { activeTab, organization_id, type } = req.query;
       
            // Initialize the query object with organization_id
            let query = { organization_id };

            // Filter by activeTab (status) if provided and valid
            if (activeTab) {
                query.parentType = activeTab;  // Ensure it's in lowercase to match stored values like 'active'
            }
        
            // Filter by questionType if provided
            if (type) {
                query.questionType = type;  // Assuming 'questionType' is a valid field in the database
            }
        
            console.log(query, 'query');  // For debugging
        
            // Find the questions using the constructed query
            const questions = await Question.find(query);
            console.log(questions)
            // Return the filtered questions in the response
            return res.status(200).json(questions);
        } catch (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };


// Function to delete a question
exports.deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Find and delete related entries in the AssignCompetency table
        const deletedAssignments = await AssignCompetency.deleteMany({ question_id: req.params.id });

        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};