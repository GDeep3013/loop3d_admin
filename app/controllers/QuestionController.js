const Question = require('../models/Question');
const AssignCompetency = require('../models/AssignCompetencyModel');

// Function to create a new question
exports.createQuestion = async (req, res) => {
    try {
        // Extract question data from the request body

        const { questionText, questionType, options, currentCategoryId, createdBy, organization_id, parentType,manager_id } = req.body;

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
        if (manager_id !== null &&manager_id !== undefined) {
            query.manager = manager_id;
            query.category_id = currentCategoryId
            query.organization_id=organization_id
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
            manager: manager_id?manager_id:null,
            parentType
        });

        // Save the question to the database first
        await newQuestion.save();

        if (questionType == "Radio") {
            // Map options to include questionId and save them to the question
            newQuestion.options = options && options.map(option => ({
                ...option,
                questionId: newQuestion._id  // Set the questionId for each option
            }));

            // Save the updated question with options
            await newQuestion.save();
        }
        // Ensure the category ID and organization ID are present
        if (newQuestion && (organization_id || currentCategoryId)) {
            // Create the new assignment
            const newAssignment = {
                user_id: createdBy,
                question_id: newQuestion._id,
                category_id: currentCategoryId ? currentCategoryId : null,
                organization_id:organization_id?organization_id:null,
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
                const newAssignmentRecord = await AssignCompetency.create(newAssignment);
                console.log('newAssignmentRecord', newAssignmentRecord);
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
        let { page = 1, limit = 10, searchTerm, type } = req.query;
  
        let query = { organization_id: null, category_id: null };
        if (type === "OpenEnded") {
            query = {
                organization_id: null, category_id: null, questionType: "OpenEnded", parentType: { $ne: null } // Ensure parentType is not null };
            };
        }
            
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

exports.getQuestionByCompetencyId = async (req, res) => {
    try {
        // Destructure query parameters and set defaults
        let { page = 1, limit = 10, searchTerm } = req.query;

        // Convert query parameters to integers
        page = parseInt(page, 10) || 1;
        limit = parseInt(limit, 10) || 10;

        // Ensure `req.params.id` is valid
        if (!req.params.id) {
            return res.status(400).json({ error: "Category ID is required." });
        }

        // Build query
        const query = {
            category_id: { $in: req.params.id },
            question_id: { $ne: null, $exists: true },
            organization_id: { $eq: null }
        };

        // Add search functionality
        if (searchTerm) {
            query.$or = [
                { "question_id.questionText": { $regex: searchTerm, $options: 'i' } } // Nested field search
            ];
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch questions with population and filter by `Radio` type
        const questions = await AssignCompetency.find(query)
            .sort({ _id: -1 }) // Sort by latest first
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'question_id',
                match: { questionType: 'Radio' }, // Filter only `Radio` type
                select: 'questionType status questionText options' // Select specific fields
            });

        // Filter out entries where `question_id` is null due to population filtering
        const filteredQuestions = questions.filter(q => q.question_id);

        // Total document count for filtered questions
        const totalQuestions = filteredQuestions.length;

        // Calculate total pages
        const totalPages = Math.ceil(totalQuestions / limit);

        // Respond with data
        res.status(200).json({
            questions: filteredQuestions,
            meta: {
                totalQuestions,
                currentPage: page,
                totalPages,
                pageSize: limit,
            },
        });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
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
            const { activeTab, organization_id, type,manager_id } = req.query;
       
            // Initialize the query object with organization_id
            let query = { organization_id:organization_id};

            // Filter by activeTab (status) if provided and valid
            if (activeTab) {
                query.parentType = activeTab;  // Ensure it's in lowercase to match stored values like 'active'
            }
        
            // Filter by questionType if provided
            if (type) {
                query.questionType = type;  // Assuming 'questionType' is a valid field in the database
            }
            if (manager_id && organization_id) {
                query.manager = manager_id
                query.organization_id=organization_id
            } else {
                query.manager = null
            }
                
            const questions = await Question.find(query).select('questionText category_id questionType manager organization_id parentType').lean();

            // Use a Set to filter out duplicate questionText entries
            const uniqueQuestionsMap = new Map();
            questions.forEach((q) => {
                if (!uniqueQuestionsMap.has(q.questionText)) {
                    uniqueQuestionsMap.set(q.questionText, q);
                }
            });
    
            // Convert the Map back to an array
            const uniqueQuestions = Array.from(uniqueQuestionsMap.values());
    
            // Return the filtered questions in the response
            return res.status(200).json(uniqueQuestions);
        } catch (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
};
    
// exports.cloneQuestion = async (req, res) => {
//     const { organization_id, categoryId, manager_id } = req.body;

//     try {
//         // Use $or to match either category_id or organization_id
//         const questions = await Question.find({
//             $or: [
//                 { organization_id: organization_id, category_id: categoryId },  // First condition: organization_id and category_id match
//                 { organization_id: organization_id, questionType: 'OpenEnded' }  // Second condition: organization_id and questionType "OpenEnded"
//             ]
//         });
//         const clonedQuestions = [];

//         // Iterate over the existing assignments
//         for (const question of questions) {
//             // Check if the question already exists in the same category and organization
//             const existingQuestion = await Question.findOne({
//                 $or: [             
//                 {
//                     questionText: question.questionText,
//                     category_id: categoryId,
//                     organization_id: organization_id,
//                     manager: manager_id
//                 },
//                 {
//                     questionText: question.questionText,
//                     organization_id: organization_id,
//                     manager: manager_id,
//                     questionType: 'OpenEnded'
//                 }]
//             });

//             // If the question already exists, skip cloning
//             if (existingQuestion) {
//                 continue;  // Skip cloning this question
//             }

//             // Clone the question based on its properties
//             const clonedQuestion = new Question({
//                 questionType: question.questionType,
//                 questionText:  question.questionText,
//                 parentType:question.parentType?question.parentType:null,
//                 options: question.options,  // Assuming 'options' is part of the question
//                 category_id: categoryId,   // Assign the new category_id
//                 organization_id: organization_id,
//                 manager: manager_id,        // Assign the new manager_id
//                 status: 'active',           // Status can be set to 'active' or any other status you prefer
//             });

//             // Save the cloned question
//             await clonedQuestion.save();
//             if (clonedQuestion._id) {
                
//                 clonedQuestions.push({
//                     questionText: clonedQuestion.questionText,
//                     category_id: categoryId,
//                     organization_id: organization_id,
//                     question_id:clonedQuestion._id,
//                       user_id: manager_id,
//                 });
//             }

//             // Add to the set to avoid duplicating in future iterations
//         }
//         if (clonedQuestions.length > 0) {
//             await AssignCompetency.insertMany(clonedQuestions);
//         }

//         // Save the assignments if there are new cloned questions

//         // Send a success response after cloning questions
//         res.status(200).json({ message: 'Questions cloned successfully.' });

//     } catch (error) {
//         console.error('Error cloning questions:', error);
//         res.status(500).json({ message: 'Failed to clone questions.', error: error.message });
//     }
// };



exports.deleteQuestion = async (req, res) => {  
    try {
        // const Question1 = await Question.findById(req.params.id);
        // return res.status(404).json({ message: Question1 });
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