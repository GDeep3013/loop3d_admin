// controllers/SurveyAnswersController.js
const SurveyAnswers = require('../models/SurveyAnswers');
const SurveyParticipant = require('../models/SurveyParticipantModel');
const Survey = require('../models/Survey')
const {
    sendEmail
} = require('../../emails/sendEmail');
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

            if (!optionId && !answerText) {
                throw new Error(`A valid optionId or answer is required for question: ${questionId}`);
            }

            return {
                questionId,
                optionId: optionId || null, 
                answer: answerText || null 
            };
        });

        // Fetch the survey details
        const survey = await Survey.findById(survey_id)
            .populate('loop_lead', 'first_name last_name email') // Populate loop_lead_id with name and email fields
            .populate('manager', 'first_name last_name email') // Populate mgr_id with name and email fields
            .populate('organization', 'name') // Populate organization_id with name
            .populate('competencies', '_id');
        if (!survey) {
            return res.status(404).json({ error: "Survey not found" });
        }

        // Update survey status based on the participant_id
        if (survey?.loop_lead?._id?.toString() === participant_id) {
            await Survey.findByIdAndUpdate(survey_id, { ll_survey_status: 'yes' });
        } else if (survey.manager?._id?.toString() === participant_id) {
            await Survey.findByIdAndUpdate(survey_id, { mgr_survey_status: 'yes' });
        }

        // Check if there's an existing SurveyAnswers document
        let existingAnswers = await SurveyAnswers.findOne({ survey_id, participant_id });

        if (existingAnswers) {
            existingAnswers.answers = formattedAnswers;
            await existingAnswers.save();
        } else {
            const newAnswers = new SurveyAnswers({ survey_id, participant_id, answers: formattedAnswers });
            await newAnswers.save();
        }

        // Update participant's survey status to completed
        await SurveyParticipant.findByIdAndUpdate(participant_id, { survey_status: 'completed' }, { new: true });

   

        const allParticipants = await SurveyParticipant.find({ survey_id });

            const completedParticipants = allParticipants.filter(participant => participant.survey_status === 'completed');

            const requiredCompletedParticipants = 5;
            const allParticipantsCompleted = completedParticipants.length >= requiredCompletedParticipants;

            const surveyUpdated = await Survey.findById(survey_id);
            const isSurveyComplete = surveyUpdated.ll_survey_status === 'yes' && surveyUpdated.mgr_survey_status === 'yes';

            let summary_url = `${process.env.ADMIN_PANEL}/survey-summary/`+ survey?._id
            let name = survey?.loop_lead?.first_name
            let email = survey?.loop_lead?.email
                if (allParticipantsCompleted) {
                    
                    await Survey.findByIdAndUpdate(survey_id, { report_gen_date: Date.now() });
                  
        
                    await sendEmail('sendSumaryReport', {
                        name,
                        email,
                        summary_url
                    });
                }
                if (completedParticipants.length == (allParticipants.length)  && isSurveyComplete) {
                    await Survey.findByIdAndUpdate(survey_id, { survey_status: 'completed' });
                    
                    await sendEmail('sendSumaryReport', {
                        name,
                        email,
                        summary_url
                    });
                }
        
                return res.status(existingAnswers ? 200 : 201).json({
                    message: 'Survey answers saved successfully!'
                });
        
    } catch (error) {
        console.error('Error saving or updating survey answers:', error);
        return res.status(500).json({ error: 'Failed to save or update survey answers' });
    }
};

exports.getSurveyAnswersBySurveyId = async (req, res) => {
    const {
        survey_id
    } = req.params;

    try {
        if (!survey_id) {
            return res.status(404).json({
                message: "Survey id is required."
            });
        }

        // Find answers by survey_id and populate participant and question details
        const surveyAnswers = await SurveyAnswers.find({
                survey_id
            })
            .populate('participant_id', 'p_first_name p_last_name p_email survey_status p_type createdAt') // Participant details
            .populate('answers.questionId', 'questionText options questionType') // Question details
            .exec();

        // Check if no answers found
        if (!surveyAnswers || surveyAnswers.length === 0) {
            return res.status(404).json({
                message: "No answers found for this survey."
            });
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
        return res.status(500).json({
            error: 'Failed to fetch survey answers'
        });
    }
};

exports.getTotalParticipantsInvited = async (req, res) => {
    const { survey_id } = req.params;

    try {
        if (!survey_id) {
            return res.status(400).json({
                error: "Survey ID is required."
            });
        }

        // Retrieve the survey to get loop_lead_id and manager_id
        const survey = await Survey.findById(survey_id)
            .populate('loop_lead', 'first_name last_name email') // Populate loop_lead_id with name and email fields
            .populate('manager', 'first_name last_name email')
            .exec();

        if (!survey) {
            return res.status(404).json({
                error: "Survey not found."
            });
        }

        // Initialize totals and completed responses objects
        const participantTypes = ['Self', 'Direct Report', 'Teammate', 'Supervisor', 'Other'];
        const totals = {};
        const completedResponses = {};
        const participantDetails = {};

        // Fetch all participants invited to the survey along with their names and types
        const participants = await SurveyParticipant.find({ survey_id })
            .select('p_first_name p_last_name p_email p_type survey_status')
            .exec();

        for (const type of participantTypes) {
            // Filter participants by type and count them
            const participantsOfType = participants.filter(participant => participant.p_type === type);
            // Count total participants and completed responses by type
            totals[type] = participantsOfType.length;
            completedResponses[type] = participantsOfType.filter(participant => participant.survey_status === 'completed').length;
        }

        // Set default values for Self and Supervisor if no entries are found
        if (totals['Self'] === 0) {
            totals['Self'] = 1; // Default value if no 'Self' entries
            completedResponses['Self'] = (survey.ll_survey_status === "no") ? 0 : 1;
        }
        if (totals['Supervisor'] === 0) {
            totals['Supervisor'] = 1; // Default value if no 'Supervisor' entries
            completedResponses['Supervisor'] = (survey.mgr_survey_status === "no") ? 0 : 1;
        }

        // Count total invited participants
        const totalInvited = participants.length;

        // Calculate percentage of completed responses
        const totalCompleted = Object.values(completedResponses).reduce((a, b) => a + b, 0);
        const percentageCompleted = totalInvited > 0
            ? ((totalCompleted / totalInvited) * 100).toFixed(2)
            : 0;

        return res.status(200).json({
            survey,
            totals,
            completedResponses,
            participants,  // Include participant details with names, types, and emails
            percentageCompleted
        });

    } catch (error) {
        console.error('Error fetching participant totals:', error);
        return res.status(500).json({
            error: 'Failed to fetch participant totals'
        });
    }
};