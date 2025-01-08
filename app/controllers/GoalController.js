const Goals = require('../models/Goals');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const SurveyAnswers = require('../models/SurveyAnswers');
const SurveyParticipant = require('../models/SurveyParticipantModel');
const Survey = require('../models/Survey')

const AssignCompetency = require('../models/AssignCompetencyModel');
const Category = require('../models/CategoryModel')
const SurveyReport = require('../models/SurveyReport')


exports.createGoals = async (req, res) => {
    try {

        const { specific_goal, dead_line, competency, goal_apply, goal_result, status, marked_as } = req.body;

        const newGoals = new Goals({
            specific_goal,
            dead_line,
            competency,
            goal_apply,
            goal_result,
            status,
            marked_as
        });

        const savedGoals = await newGoals.save();
        res.status(201).json(savedGoals);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
},
    exports.getAllGoals = async (req, res) => {
        try {
            const { survey_id } = req.params; // Get survey_id from route parameters

            // Find goals based on the survey_id and populate the related Category (competency) information
            const goals = await Goals.find({ survey_id: survey_id })
                .populate({
                    path: 'competency', // Populate the competency field, which is a reference to Category
                    model: 'Category',
                    select: 'category_name competency_type', // Fields to select from Category
                });

            // Check if no goals were found
            if (!goals || goals.length === 0) {
                return res.status(404).json({ message: 'No goals found for the given survey ID' });
            }

            // Return the goals with populated category (competency) information
            res.status(200).json(goals);

        } catch (error) {
            console.error('Error fetching goals:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

exports.generatePlans = async (req, res) => {
    try {
        const { promptResponse=null,
            option=null,
            survey_id,
            reGenerate = null,
            chatResponse = null,
            activeCompetency = null} = req.body;

        const survey = await Survey.findById(survey_id)
            .populate('loop_lead', 'first_name last_name email _id')
            .populate('manager', 'first_name last_name email')
            .populate('organization', 'name')
            .populate('competencies', '_id');

        if (!survey) {
            return res.status(404).json({
                error: 'Survey not found'
            });
        }

        const categoryIds = survey.competencies.map(comp => comp._id);
        const assignCompetencies = await AssignCompetency.find({
            category_id: {
                $in: categoryIds
            },
            organization_id: null
        }).populate({
            path: 'question_id',
            select: 'questionText questionType options',
            populate: {
                path: 'options',
                select: 'text weightage'
            }
        });

        const questionsArray = assignCompetencies.map(ac => ac?.question_id);
        const questions = Array.from(new Set(questionsArray.map(q => q?._id)))
            .map(id => questionsArray.find(q => q?._id.equals(id)));

        const competencies = await Category.find({
            _id: {
                $in: categoryIds
            }
        });

        const report = {
            surveyDetails: {
                id: survey?._id,
                name: survey.name,
                loop_lead: survey.loop_lead,
                manager: survey.manager,
                organization: survey.organization.name,
            },
            categories: {}
        };

        // Initialize categories for all competencies
        competencies.forEach((category) => {
            report.categories[category.category_name] = {
                Self: {
                    totalQuestions: 0,
                    totalWeightage: 0,
                    textAnswers: []
                },
                'Direct Report': {
                    totalQuestions: 0,
                    totalWeightage: 0,
                    textAnswers: []
                },
                Teammate: {
                    totalQuestions: 0,
                    totalWeightage: 0,
                    textAnswers: []
                },
                Supervisor: {
                    totalQuestions: 0,
                    totalWeightage: 0,
                    textAnswers: []
                },
                Other: {
                    totalQuestions: 0,
                    totalWeightage: 0,
                    textAnswers: []
                }
            };
        });

        // Process Loop Lead (Self)
        const loopLeadAnswers = await SurveyAnswers.findOne({
            participant_id: survey?.loop_lead?._id
        });
        processParticipantAnswers(survey.loop_lead, loopLeadAnswers?.answers, 'Self', assignCompetencies, competencies, questions, report);

        // Process Manager (Supervisor)
        const managerAnswers = await SurveyAnswers.findOne({
            participant_id: survey.manager?._id
        });
        processParticipantAnswers(survey.manager, managerAnswers?.answers, 'Supervisor', assignCompetencies, competencies, questions, report);

        // Process other participants (Direct Report, Teammate, Other)
        const participants = await SurveyParticipant.find({
            survey_id
        });
        for (const participant of participants) {
            const participantType = participant.p_type || 'Other';
            const participantAnswers = await SurveyAnswers.findOne({
                participant_id: participant?._id
            });
            processParticipantAnswers(participant, participantAnswers?.answers, participantType, assignCompetencies, competencies, questions, report);
        }
        const summary = await generateSummary(survey_id, report);

        let fullPrompt= ''
        if (reGenerate) {
         fullPrompt = "Make the goal more specific and more measurable, ensuring it’s related to the chosen competency . The response should be in plain text without extra headings, bullet points, or other formatting and 2 lines only .\n\n smaty goal:\n" + promptResponse + "\n\n  competency :\n" + activeCompetency + ";"            
        } else {
            fullPrompt= "Make the goal on behalf of my goal and their status here is my goals\n\n"+ chatResponse +  " \n\n generate one SMART plans for the competency " + option + " The response should be in plain text without extra headings,without any status, bullet points, or other formatting and 2 lines only."
            //  fullPrompt = "Input Value : " + prompt + " . Based on the following survey results and developmental suggestions, generate one SMART plans for the competency " + option + " The response should be in plain text without extra headings, bullet points, or other formatting and 2 lines only .\n\n Survey Results:\n" + summary + "\n\n;"
        } 
    
        const response = await openai.chat.completions.create({
            model: process.env.OPEN_AI_MODEL, // Correct model name
            messages: [
                { role: 'system', content: 'You are an AI assistant that helps analyze plans results.' },
                { role: 'user', content: fullPrompt } // Use the combined prompt
            ]
        });

        const content = response?.choices?.[0]?.message?.content;

        res.json({ 'content': content, 'competency': option?option:activeCompetency });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error connecting to ChatGPT API' });
    }
};

const generateSummary = async (survey_id, report) => {
    try {
        // Step 1: Collect all text answers
        const combinedAnswers = [];

        Object.values(report?.categories || {}).forEach(category => {
            Object.values(category).forEach(participantType => {
                combinedAnswers.push(...(participantType.textAnswers || []));
            });
        });

        // Step 2: Organize answers by question text and participant type
        const result = {};

        combinedAnswers.forEach(answer => {
            const { questionText, answerText, participant } = answer;
            const { type: participantType } = participant;

            if (!result[questionText]) {
                result[questionText] = {};
            }

            if (!result[questionText][participantType]) {
                result[questionText][participantType] = [];
            }

            result[questionText][participantType].push(answerText);
        });

        // Step 3: Format result to match desired output
        const summaryResults = [];

        Object.keys(result).forEach(questionText => {
            const questionData = result[questionText];

            Object.keys(questionData).forEach(participantType => {
                const answers = questionData[participantType];

                answers.forEach((answerText, index) => {
                    summaryResults.push(`Relationship: ${participantType}, Question: ${questionText}, Answer: ${answerText}`);
                });
            });
        });

        // Convert the summary to JSON if needed or return as is
        return summaryResults;

    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
};

const processParticipantAnswers = (participant, answers, participantType, assignCompetencies, competencies, questions, report) => {
    if (answers) {
        for (const answer of answers) {
            const question = questions.find(q => q?._id.equals(answer?.questionId));
            if (question) {
                const assignCompetency = assignCompetencies?.find(ac => ac?.question_id?.equals(question?._id));
                if (assignCompetency) {
                    const competency = competencies.find(c => c?._id.equals(assignCompetency?.category_id));
                    if (competency) {
                        const categoryName = competency?.category_name;
                        const selectedOption = question.options.find(option =>
                            option?._id?.toString() === answer?.optionId?.toString()
                        );
                        const weightage = selectedOption ? selectedOption.weightage : (answer?.weightage || 0);

                        // Initialize category for each participant type
                        if (!report.categories[categoryName]) {
                            report.categories[categoryName] = {
                                Self: {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: []
                                },
                                'Direct Report': {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: []
                                },
                                Teammate: {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: []
                                },
                                Supervisor: {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: []
                                },
                                Other: {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: []
                                }
                            };
                        }

                        // Increment totalQuestions and totalWeightage for the participantType
                        if (!answer.answer) {
                            report.categories[categoryName][participantType].totalQuestions += 1;
                        } else {
                            if (question?.questionType === 'Text') {
                                // Handle text-based questions (free text answers)
                                report.categories[categoryName][participantType].textAnswers.push({
                                    id: question?._id,
                                    questionText: question.questionText,
                                    answerText: answer.answer,
                                    participant: {
                                        type: participantType, // Participant type (Self, Direct Report, etc.)
                                        id: participant.id, // Assuming there's an ID for the participant
                                        name: `${participant.p_first_name} ${participant.p_last_name}`, // Assuming participant has first and last name
                                        email: participant.p_email // Assuming participant has an email
                                    }
                                });
                            }
                        }
                        report.categories[categoryName][participantType].totalWeightage += weightage;
                    }
                }
            }
        }
    }
};

exports.savePlans = async (req, res) => {
    try {
        const { chatResponse, competency, survey_id } = req.body;
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30)

        const categories = await Category.find({
            category_name: competency
        });

        // Check if any categories were found
        if (!categories.length) {
            return res.status(404).json({ message: 'No matching categories found' });
        }

        const newGoals = new Goals({
            specific_goal: chatResponse,
            survey_id: survey_id,
            dead_line: deadline,
            competency: categories[0]?._id,

        });
        const savedGoals = await newGoals.save();
        res.status(201).json(savedGoals);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

exports.deletePlans = async (req, res) => {
    try {
        const { id } = req.params;
        await Goals.findByIdAndDelete(id); // Delete the goal from the database
        res.status(204).send(); // Send a no content response
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.updateGoal = async (req, res) => {
    const goalId = req.params.id;
    const updatedData = req.body;

    try {
        // Find the goal by its ID, update it with the new data, and return the updated document
        let updatedGoal = await Goals.findByIdAndUpdate(goalId, updatedData, { new: true })
            .populate('competency', 'category_name competency_type'); // Populate the competency field

        if (!updatedGoal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        // Send back the updated goal including the specific_goal and the populated competency data
        return res.status(200).json({
            message: 'Goal updated successfully',
            specific_goal: updatedGoal.specific_goal,
            competency: updatedGoal.competency, // Now includes category_name and competency_type
        });
    } catch (error) {
        console.error('Error updating goal:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.getCategoriesByOrg = async (req, res) => {

    try {
        const { surveyId } = req.params;

        const survey = await Survey.findById(surveyId)
            .populate('organization')  // Fetch organization details
            .exec();

        if (!survey) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        // Step 2: Fetch competencies (categories) assigned to the organization using AssignCompetency model
        const assignedCompetencies = await AssignCompetency.find({
            organization_id: survey.organization._id
        }).populate('category_id'); // Populate categories

        // Step 3: Extract the actual categories from the assignment records
        const categories = assignedCompetencies.map(ac => ac.category_id);

        // Step 4: Respond with the survey details and associated categories
        res.status(200).json({
            survey,
            organization: survey.organization,
            categories,  // Competency categories related to the organization
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


