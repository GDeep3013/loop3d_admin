// controllers/SurveyAnswersController.js
const SurveyAnswers = require('../models/SurveyAnswers');
const SurveyParticipant = require('../models/SurveyParticipantModel');
const Survey = require('../models/Survey')
// Save or Update Survey Answers
exports.saveSurveyAnswers = async (req, res) => {
    const { survey_id, participant_id, answers } = req.body;

    try {
        // Validate if required data is present
        if (!survey_id || !participant_id || !answers || !answers.length) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate each answer
        const formattedAnswers = answers.map(answer => {
            const { questionId, optionId, answer: answerText } = answer;

            if (!questionId) {
                throw new Error("Question ID is required for each answer.");
            }

            // Ensure either optionId or answerText is present
            if (!optionId && !answerText) {
                throw new Error(`A valid optionId or answer is required for question: ${questionId}`);
            }

            // Return the formatted answer
            return {
                questionId,
                optionId: optionId || null, // Optional for text-based answers
                answer: answerText || null // Optional for multiple-choice questions
            };
        });

        // Check if there's an existing SurveyAnswers document for this survey and participant
        let existingAnswers = await SurveyAnswers.findOne({
            survey_id,
            participant_id
        });

        if (existingAnswers) {
            // Update existing answers
            existingAnswers.answers = formattedAnswers;
            await existingAnswers.save();
            await SurveyParticipant.findByIdAndUpdate(
                participant_id, // Directly pass the participant ID
                { survey_status: 'completed' }, // Update survey status
                { new: true } // Return the updated document
            );
            return res.status(200).json({ message: 'Survey answers updated successfully!' });
        } else {
            // Create new survey answers
            const newAnswers = new SurveyAnswers({
                survey_id,
                participant_id,
                answers: formattedAnswers
            });
            await newAnswers.save();
            await SurveyParticipant.findByIdAndUpdate(
                participant_id, // Directly pass the participant ID
                { survey_status: 'completed' }, // Update survey status
                { new: true } // Return the updated document
            );
            return res.status(201).json({ message: 'Survey answers saved successfully!' });
        }
    } catch (error) {
        console.error('Error saving or updating survey answers:', error);
        return res.status(500).json({ error: 'Failed to save or update survey answers' });
    }
};

exports.getSurveyAnswersBySurveyId = async (req, res) => {
    const { survey_id } = req.params;

    try {
        if (!survey_id) {
            return res.status(404).json({ message: "Survey id is required." });
        }

        // Find answers by survey_id and populate participant and question details
        const surveyAnswers = await SurveyAnswers.find({ survey_id })
            .populate('participant_id', 'p_first_name p_last_name p_email survey_status p_type createdAt') // Participant details
            .populate('answers.questionId', 'questionText options questionType') // Question details
            .exec();

        // Check if no answers found
        if (!surveyAnswers || surveyAnswers.length === 0) {
            return res.status(404).json({ message: "No answers found for this survey." });
        }

        // Format the survey answers, including finding the selected option text
        const formattedSurveyAnswers = surveyAnswers.map(answer => {
            const formattedAnswers = answer.answers.map(singleAnswer => {
                // Find the selected option based on optionId
                const selectedOption = singleAnswer.questionId.options.find(option => 
                    option?._id?.toString() === singleAnswer?.optionId?.toString()
                );

                return {
                    questionText: singleAnswer.questionId.questionText,
                    selectedOption: selectedOption ? selectedOption : 'No option selected',
                    answer: singleAnswer.answer // If any additional answer field is present
                };
            });

            return {
                participant: answer.participant_id, // Participant details
                answers: formattedAnswers // Formatted answers with selected option text
            };
        });

        // Return the formatted survey answers
        return res.status(200).json(formattedSurveyAnswers);
    } catch (error) {
        console.error('Error fetching survey answers:', error);
        return res.status(500).json({ error: 'Failed to fetch survey answers' });
    }
};

exports.getTotalParticipantsInvited = async (req, res) => {
    const { survey_id } = req.params; // Use req.query or req.params depending on route configuration

    try {
        if (!survey_id) {
            return res.status(400).json({ error: "Survey ID is required." });
        }

        // Retrieve the survey to get loop_lead_id and manager_id
        const survey = await Survey.findById(survey_id).select('_id')
            .populate('loop_lead', 'first_name last_name email') // Populate loop_lead_id with name and email fields
            .populate('manager', 'first_name last_name email')
            .exec();

        if (!survey) {
            return res.status(404).json({ error: "Survey not found." });
        }


        // Initialize totals and completed responses objects
        const participantTypes = ['Self', 'Direct Report', 'Teammate', 'Supervisor', 'Other'];
        const totals = {};
        const completedResponses = {};

        // Count total participants invited by type
        for (const type of participantTypes) {
            totals[type] = await SurveyParticipant.countDocuments({
                p_type: type,
                survey_id: survey_id
            });

            // Count completed responses by type
            completedResponses[type] = await SurveyParticipant.countDocuments({
                p_type: type,
                survey_id: survey_id,
                survey_status: 'completed'
            });
        }

        // Set default values for Self and Supervisor if no entries are found
        if (totals['Self'] === 0) {
            totals['Self'] = 1; // Default value if no 'Self' entries
            completedResponses['Self'] = 0; // Default completed responses if no 'Self' entries
        }
        if (totals['Supervisor'] === 0) {
            totals['Supervisor'] = 1; // Default value if no 'Supervisor' entries
            completedResponses['Supervisor'] = 0; // Default completed responses if no 'Supervisor' entries
        }

        // Count total invited participants
        const totalInvited = await SurveyParticipant.countDocuments({
            survey_id: survey_id
        });

        // Calculate percentage of completed responses
        const totalCompleted = Object.values(completedResponses).reduce((a, b) => a + b, 0);
        const percentageCompleted = totalInvited > 0
            ? ((totalCompleted / totalInvited) * 100).toFixed(2)
            : 0;

        return res.status(200).json({
            survey,
            totals,
            completedResponses
        });

    } catch (error) {
        console.error('Error fetching participant totals:', error);
        return res.status(500).json({ error: 'Failed to fetch participant totals' });
    }
};
