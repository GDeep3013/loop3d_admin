const Survey = require('../models/Survey');
const SurveyParticipant = require('../models/SurveyParticipantModel');
const User = require('../models/User')
const Role = require('../models/Role')
const AssignCompetency = require('../models/AssignCompetencyModel');
const Category = require('../models/CategoryModel')
const SurveyReport = require('../models/SurveyReport')
const axios = require('axios');

const {
    sendEmail
} = require('../../emails/sendEmail');
const SurveyAnswers = require('../models/SurveyAnswers');
const bcrypt = require('bcrypt');

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });


const {
    check,
    validationResult
} = require('express-validator');


const generateRandomPassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
};

// Create Survey and Add Survey Members
exports.createSurvey = async (req, res) => {
    try {
        // Validate request
        await check('surveyData').not().isEmpty().withMessage('surveyData is required').run(req);
        await check('surveyData.mgr_id').not().isEmpty().withMessage('Manager ID (manager) is required').run(req);
        await check('surveyData.loop_leads').isArray({
            min: 1
        }).withMessage('At least one loop lead is required').run(req);
        await check('surveyData.loop_leads.*.email').isEmail().withMessage('Invalid email').run(req);
        await check('surveyData.loop_leads.*.name').not().isEmpty().withMessage('Name is required').run(req);
        await check('surveyData.competencies').isArray().withMessage('Competencies must be an array').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            surveyData
        } = req.body;
        const loopLeads = surveyData.loop_leads;
        const manager = await User.findById(surveyData.mgr_id);
        let savedSurveys = [];

        for (let lead of loopLeads) {
            const {
                name,
                email
            } = lead;

            // Check if the user already exists by email
            let user = await User.findOne({
                email: email
            });
            let password = generateRandomPassword(10);
            const hashedPassword = await bcrypt.hash(password, 10);
            if (!user) {
                // Create a new loop lead user
                let role = await Role.findOne({
                    type: "looped_lead"
                });

                // Create the user object
                console.log(password, hashedPassword);
                user = new User({
                    first_name:name,
                    email,
                    role: role?._id,
                    password: hashedPassword,
                    organization: manager?.organization || null,
                    created_by: surveyData.mgr_id
                });

                await user.save();

            }

            // Create the survey and associate it with the user
            const survey = new Survey({
                name: surveyData.name,
                manager: surveyData.mgr_id,
                loop_lead: user._id,
                organization: manager?.organization,
                competencies: surveyData.competencies || []
            });

            const savedSurvey = await survey.save();
            let admin_panel_url = `${process.env.ADMIN_PANEL}/forget-password`;
            let url = `${process.env.ADMIN_PANEL}/lead-dashboard?token=` + savedSurvey?._id
            let first_name = name
            let summary_url = `${process.env.ADMIN_PANEL}/survey-summary?survey_id=` + savedSurvey?._id
            await sendEmail('sendCredentialMail', {
                first_name,
                email,
                password,
                admin_panel_url
            });
            await sendEmail('sendLoopLeadLink', {
                name,
                email,
                url
            });
            await sendEmail('sendSumaryReport', {
                name,
                email,
                summary_url
            });

            savedSurveys.push(savedSurvey);
        }

        res.status(201).json({
            status: 'success',
            data: {
                surveys: savedSurveys,
                message: 'Surveys created and associated with users'
            }
        });
    } catch (error) {
        console.error('Error creating surveys and loop leads:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

exports.createSurveyParticipants = async (req, res) => {
    try {
        await check('participants').isArray({
                min: 1
            }).withMessage('Participants array is required and cannot be empty').run(req),
            await check('survey_id').not().isEmpty().withMessage('Survey ID is required for each participant').run(req),
            await check('participants.*.p_first_name').not().isEmpty().withMessage('Participant first name is required').run(req),
            await check('participants.*.p_last_name').not().isEmpty().withMessage('Participant last name is required').run(req),
            await check('participants.*.p_type').not().isEmpty().withMessage('Participant type is required').run(req),

            await check('participants.*.p_email').isEmail().withMessage('Invalid email address').run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            participants,
            survey_id
        } = req.body;



        let savedParticipants = [];
        let loop_lead_name = '';
        let mrg_name = ''
        let loop_lead_email = '';
        let mrg_email = ''
        let url = ''
        let loop_lead_id = ''
        let mrg_id = ''
        let p_email = ''
      
        for (let participant of participants) {
            const {
                p_first_name,
                p_last_name,
                p_email,
                p_type
            } = participant;

            // Create a new SurveyParticipant
            const newParticipant = new SurveyParticipant({
                survey_id,
                p_type,
                p_first_name,
                p_last_name,
                p_email
            });

            const savedParticipant = await newParticipant.save();

            const survey = await Survey.findById(survey_id)
                .populate('manager', 'first_name last_name email')
                .populate('loop_lead', 'first_name last_name email');

            let name = survey?.loop_lead?.first_name;

            loop_lead_name = survey ?.loop_lead ?.first_name;
            mrg_name = survey?.manager?.first_name;

            loop_lead_email = survey?.loop_lead?.email;
            mrg_email = survey?.manager?.email;

            loop_lead_id = survey?.loop_lead?._id;
            mrg_id = survey?.manager?._id


            let url = `${process.env.FRONT_END_URL}/feedback-survey?survey_id=${survey_id}&participant_id=${savedParticipant?._id}`
            await sendEmail('sendMailToParticipant', {
                name,
                p_email,
                url
            });

            savedParticipants.push(savedParticipant);
        }

        // send feedback form to loopLead

        p_email = loop_lead_email;
        let name = loop_lead_name
        url = `${process.env.FRONT_END_URL}/feedback-survey?survey_id=${survey_id}&participant_id=${loop_lead_id}`
        await sendEmail('sendMailToParticipant', {
            name,
            p_email,
            url
        });

        // send feedback form to Manger
        p_email = mrg_email;
        name = mrg_name
        url = `${process.env.FRONT_END_URL}/feedback-survey?survey_id=${survey_id}&participant_id=${mrg_id}`
        await sendEmail('sendMailToParticipant', {
            name,
            p_email,
            url
        });

        res.status(201).json({
            status: 'success',
            data: {
                participants: savedParticipants,
                message: 'Survey participants created successfully'
            }
        });
    } catch (error) {
        console.error('Error creating survey participants:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

exports.getAllSurvey = async (req, res) => {
    try {
        let {
            searchTerm,
            page = 1,
            limit = 10
        } = req.query;
        const query = {};

        if (searchTerm) {
            query.$or = [{
                    survey_status: {
                        $regex: searchTerm,
                        $options: 'i'
                    }
                },
                {
                    ll_survey_status: {
                        $regex: searchTerm,
                        $options: 'i'
                    }
                },
                {
                    mgr_survey_status: {
                        $regex: searchTerm,
                        $options: 'i'
                    }
                }
            ];
        }

        // Convert pagination parameters to integers
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Find the surveys with pagination and populate related fields
        const surveys = await Survey.find(query)
            .populate('manager', 'first_name last_name email')
            .populate('loop_lead', 'first_name last_name email')
            .populate('organization', 'name')
            .skip(skip)
            .limit(limit);

        // Get the total number of surveys
        const totalSurveys = await Survey.countDocuments(query);

        // Calculate total number of pages
        const totalPages = Math.ceil(totalSurveys / limit);

        // Fetch additional details for each survey
        const results = await Promise.all(
            surveys.map(async (survey) => {
                const totalParticipants = await SurveyParticipant.countDocuments({
                    survey_id: survey._id
                });
                const completed_survey = await SurveyParticipant.countDocuments({
                    survey_id: survey._id,
                    survey_status: 'completed'
                });

                return {
                    ...survey.toObject(),
                    totalParticipants,
                    completed_survey
                };
            })
        );

        // Respond with paginated surveys and pagination info
        res.status(200).json({
            status: 'success',
            surveys: results,
            meta: {
                totalSurveys,
                totalPages,
                currentPage: page,
                pageSize: limit,
            }
        });
    } catch (error) {
        console.error('Error fetching surveys:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

exports.getSurveyById = async (req, res) => {
    try {
        const {
            loop_lead_id,
            mgr_id,
            survey_id,
            org_id
        } = req.query;

        // Build the query object based on the provided parameters
        let query = {};
        if (loop_lead_id && org_id) query = {
            loop_lead: loop_lead_id,
            organization: org_id
        };
        if (mgr_id) query.manager = mgr_id;
        if (loop_lead_id && mgr_id) query = {
            loop_lead: loop_lead_id,
            manager: mgr_id
        };

        if (loop_lead_id) query = {
            loop_lead: loop_lead_id
        };


        if (survey_id) query._id = survey_id;

        // Step 1: Find the survey(s) by the provided ID(s) and populate related fields
        const surveys = await Survey.find(query)
            .populate('loop_lead', 'first_name last_name email') // Populate loop_lead_id with name and email fields
            .populate('manager', 'first_name last_name email') // Populate mgr_id with name and email fields
            .populate('organization', 'name') // Populate organization_id with name
            .populate('competencies', '_id'); // Populate competencies with _id (Category)

        if (!surveys || surveys.length === 0) {
            return res.status(404).json({
                error: 'Survey not found'
            });
        }

        // Step 2: Fetch related AssignCompetency data for the survey(s)
        const categoryIds = surveys.flatMap(survey => survey.competencies.map(comp => comp._id));
        const assignCompetencies = await AssignCompetency.find({
                category_id: {
                    $in: categoryIds
                },
                organization_id: null
            })
            .populate({
                path: 'question_id', // Populate question_id field
                select: 'questionText questionType options', // Select only the necessary fields from Question
                populate: {
                    path: 'options', // Populate options within the question
                    select: 'text weightage' // Select only text and weightage fields from Option
                }
            })
        const questionsArray = assignCompetencies.map(ac => ac?.question_id);

        // Optionally remove duplicates if needed (e.g., if multiple entries for the same question)
        const questions = Array.from(new Set(questionsArray.map(q => q?._id)))
            .map(id => {
                return questionsArray.find(q => q?._id.equals(id));
            });


        const competencies = await Category.find({
            _id: {
                $in: categoryIds
            }
        })

        // Step 3: Merge competencies and assignCompetencies data into the survey(s)
        const results = await Promise.all(surveys.map(async (survey) => {

            const totalParticipants = await SurveyParticipant.countDocuments({
                survey_id: survey._id
            });
            const completed_survey = await SurveyParticipant.countDocuments({
                survey_id: survey._id,
                survey_status: 'completed'
            });

            return {
                ...survey.toObject(), // Convert the Mongoose document to a plain object
                totalParticipants,
                completed_survey,
                competencies,
                questions
            };
        }));

        // Step 4: Return the result in the response
        res.status(200).json({
            status: 'success',
            data: results
        });
    } catch (error) {
        console.error('Error fetching survey:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};



exports.getSurveyParticipantsById = async (req, res) => {
    try {
        const {
            survey_id,
            participant_id
        } = req.query;

        if (!survey_id && !participant_id) {
            return res.status(400).json({
                error: 'Either survey_id or participant_id is required'
            });
        }

        // Initialize the query object
        let surveyQuery = {};
        let participantQuery = {};

        // Construct the query for surveys

        if (participant_id) {
            surveyQuery.$or = [{
                    loop_lead: participant_id
                },
                {
                    manager: participant_id
                }
            ];
        }

        // Fetch surveys based on the constructed query
        if (surveyQuery && Object.keys(surveyQuery).length > 0) {
            let surveys = await Survey.find(surveyQuery)
                .populate('loop_lead', 'first_name last_name email')
                .populate('manager', 'first_name last_name email')
                .exec();

            if (surveys.length > 0) {
                // Return the found surveys
                return res.status(200).json({
                    status: 'succesiis',
                    data: surveys
                });
            }
        }

        // If no surveys found, search for survey participants if survey_id is provided
        if (survey_id || participant_id) {
            if (survey_id) participantQuery.survey_id = survey_id;
            if (participant_id) participantQuery._id = participant_id;

            let participants = await SurveyParticipant.find(participantQuery)
                .populate('survey_id', 'name')
                .populate({
                    path: 'survey_id',
                    select: 'name',
                    populate: {
                        path: 'loop_lead',
                        select: 'first_name last_name'
                    }
                })
                .populate('p_mag_id', 'first_name last_name'); // Adjust according to your schema

            return res.status(200).json({
                status: 'successssss',
                data: participants
            });
        }

        // If no surveys or participants found
        res.status(404).json({
            error: 'No data found'
        });

    } catch (error) {
        console.error('Error fetching survey participants:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};


exports.deleteParticipant = async (req, res) => {
    try {
        const Participant = await SurveyParticipant.findByIdAndDelete(req.params.id);
        if (!Participant) {
            return res.status(404).json({
                error: "Survey Participant not found"
            });
        }
        res.status(200).json({
            message: "Survey Participant deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

const processParticipantAnswers = (participant, answers, participantType, assignCompetencies, competencies, questions, report) => {
    if (answers) {
        for (const answer of answers) {
            const question = questions.find(q => q?._id.equals(answer?.questionId));
            if (question) {
                const assignCompetency = assignCompetencies?.find(ac => ac?.question_id?.equals(question?._id));
                if (assignCompetency) {
                    const competency = competencies.find(c => c ?._id.equals(assignCompetency?.category_id));
                    if (competency) {
                        const categoryName = competency?.category_name;
                        const selectedOption = question.options.find(option =>
                            option ?._id?.toString() === answer?.optionId?.toString()
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

exports.generateSurveyReport = async (req, res) => {
    try {
        const {
            survey_id
        } = req.params;

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
                id: survey ?._id,
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
        const survey_report = await SurveyReport.findOne({ survey_id: survey_id })
        let summary=[]
        if (!survey_report) {
             summary = await generateSummary(survey_id,report);     
        } else {
            summary = survey_report?.response_Data
        }

        // Step 4: Calculate totals for each category and participant type
        for (const categoryName in report.categories) {
            const category = report.categories[categoryName];
            // Iterate over all participant types
            ['Self', 'Direct Report', 'Teammate', 'Supervisor', 'Other'].forEach(participantType => {
                if (category[participantType].totalQuestions > 0) {
                    category[participantType].averageWeightage = category[participantType].totalWeightage / category[participantType].totalQuestions;
                } else {
                    category[participantType].averageWeightage = 0; // Avoid division by zero
                }
            });
        }
        // const summary =
        // {
        //     "results": [
        //       {
        //         "question": "Q1: In what ways has this individual demonstrated effective leadership in your team or organization?",
        //         "Total Summary": "The individual is perceived to be an effective leader by most groups. They consistently demonstrate strong decision-making skills and the ability to motivate their team. However, while the individual views themselves as highly approachable, direct reports feel there is room for improvement in communication.",
        //         "Self": "The individual believes they have shown effective leadership through decisive actions and maintaining a motivated team environment.",
        //         "Direct Report": "Direct reports acknowledge the effective decision-making and motivation but suggest improvements in communication could enhance their leadership.",
        //         "Teammate": "Teammates note strong leadership qualities, particularly in motivating the team, aligning with the self-assessment but do not mention communication issues.",
        //         "Supervisor": "The supervisor supports the individual's self-assessment, highlighting their decisiveness and ability to motivate the team, without mentioning the communication gap."
        //       },
        //       {
        //         "question": "Q2: How well does this individual collaborate with peers?",
        //         "Total Summary": "Overall, the individual's collaboration skills are well-regarded. They are seen as cooperative and supportive by teammates and supervisors alike. However, while they perceive themselves as a facilitator in group settings, some teammates feel they occasionally dominate discussions.",
        //         "Self": "The individual sees themselves as a key facilitator in group collaborations fostering a cooperative environment.",
        //         "Direct Report": "Direct reports do not provide direct feedback on peer collaboration, but generally support the notion of a cooperative leader.",
        //         "Teammate": "Teammates recognize the individual's collaborative efforts but note that they can occasionally dominate discussions, contrasting with the self-assessment.",
        //         "Supervisor": "The supervisor views the individual as cooperative and supportive, aligning with the self-assessment and not mentioning dominance in discussions."
        //       },
        //       {
        //         "question": "Q3: What are areas for improvement for this individual?",
        //         "Total Summary": "The areas for improvement identified across groups include enhancing communication skills and adopting a more inclusive approach during team discussions. The individual recognizes the need for better active listening, which matches feedback from teammates and direct reports.",
        //         "Self": "The individual acknowledges the need to improve active listening and communication skills.",
        //         "Direct Report": "Direct reports indicate that improved communication and inclusive decision-making would benefit the entire team.",
        //         "Teammate": "Teammates agree with the need for better communication and suggest a more inclusive approach during team interactions.",
        //         "Supervisor": "The supervisor emphasizes the importance of improving communication, aligning with the self-assessment and feedback from other groups."
        //       },
        //       {
        //         "question": "Q4: How effectively does this individual handle conflict within the team?",
        //         "Total Summary": "The individual is largely seen as effective in handling conflicts, often resolving issues swiftly and fairly. However, the self-assessment suggests they rarely encounter conflicts, while teammates and supervisors highlight that effective conflict resolution is an area of consistent strength.",
        //         "Self": "The individual believes they handle conflicts well but note they rarely encounter such situations.",
        //         "Direct Report": "Direct reports highlight the individual's ability to resolve conflicts fairly and quickly, generally aligning with the self-assessment.",
        //         "Teammate": "Teammates appreciate the effective conflict resolution and see it as a consistent strength, noting occasional underestimation of conflict situations by the individual.",
        //         "Supervisor": "The supervisor notes the individual handles conflicts effectively and recognizes their fair and swift resolution approach, aligning with team feedback rather than the self-assessment."
        //       },
        //       {
        //         "question": "Q5: In what ways could this individual improve their contribution to the team or organization?",
        //         "Total Summary": "The individual acknowledges the need to improve strategic thinking and long-term planning. This is echoed by direct reports and supervisors, suggesting a focus on broader organizational goals could enhance their contribution. Teammates emphasize a need for balancing strategic and tactical efforts.",
        //         "Self": "The individual identifies areas for improvement in strategic thinking and long-term planning.",
        //         "Direct Report": "Direct reports suggest a stronger focus on organizational goals and enhanced strategic planning would be beneficial.",
        //         "Teammate": "Teammates emphasize the balance between strategic and tactical efforts, suggesting room for improvement in strategic contributions.",
        //         "Supervisor": "The supervisor agrees with the need to improve long-term planning and strategic focus, aligning with the self-assessment and other feedback."
        //       },
        //       {
        //         "question": "Q6: How does this individual contribute to fostering a positive team culture?",
        //         "Total Summary": "The individual is recognized for fostering a positive team culture through encouragement and support. While they see themselves as a key driver of team morale, direct reports and teammates highlight the need for more consistent efforts in recognizing and celebrating team achievements.",
        //         "Self": "The individual believes they significantly contribute to a positive team culture through encouragement and supportive actions.",
        //         "Direct Report": "Direct reports feel that while the individual does foster positivity, more consistent recognition and celebration of team achievements would be beneficial.",
        //         "Teammate": "Teammates appreciate the support and encouragement but echo the need for more consistent recognition of accomplishments.",
        //         "Supervisor": "The supervisor highlights the individual's role in fostering a positive culture, agreeing with the self-assessment but not addressing the need for consistent recognition mentioned by other groups."
        //       }
        //     ]
        //   }
        return res.status(200).json({ "summary":summary,"reports":report});

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while generating the report'
        });
    }
};

const calculateCategoryAverages = (assignCompetencies, competencies, questions, participantAnswers) => {
    let report = {};
    let topStrength = '';
    let developmentalOpportunity = '';
    let maxAverage = -Infinity;
    let minAverage = Infinity;

    competencies ?.forEach((competency) => {
        const competencyQuestions = questions ?.filter(q =>
            assignCompetencies.some(ac => ac ?.category_id.equals(competency._id) && ac ?.question_id ?._id.equals(q ?._id))
        );

        let totalQuestions = 0;
        let totalWeightage = 0;

        competencyQuestions.forEach(question => {
            // Find all participant answers for this question
            const questionAnswers = participantAnswers
                .map(pa => pa.answers.find(ans => ans ?.questionId ?.equals(question ?._id)))
                .filter(Boolean); // Filter out any undefined answers

            // Calculate the total weightage for the question
            questionAnswers.forEach(answer => {
                // Find the selected option in the question's options
                const selectedOption = question.options.find(option =>
                    option ?._id ?.toString() === answer ?.optionId ?.toString()
                );

                // Get the weightage from the selected option or fallback to answer weightage
                const weightage = selectedOption ? selectedOption.weightage : (answer ?.weightage || 0);

                // Increment total questions and total weightage
                if (!answer.answer) {

                    totalQuestions += 1;
                }
                totalWeightage += weightage;
            });
        });

        const averageWeightage = totalQuestions > 0 ? totalWeightage / totalQuestions : 0;

        report[competency.category_name] = {
            totalQuestions,
            totalWeightage,
            averageWeightage
        };

        if (averageWeightage > maxAverage) {
            maxAverage = averageWeightage;
            topStrength = competency.category_name;
        }

        if (averageWeightage < minAverage && totalQuestions > 0) {
            minAverage = averageWeightage;
            developmentalOpportunity = competency.category_name;
        }
    });

    return {
        report,
        topStrength,
        developmentalOpportunity
    };
};


exports.generateCompetencyAverageReport = async (req, res) => {
    try {
        const {
            survey_id
        } = req.params;

        // Fetch survey details and related data
        const survey = await Survey.findById(survey_id)
            .populate('loop_lead', 'first_name last_name email')
            .populate('manager', 'first_name last_name email')
            .populate('organization', 'name')
            .populate('competencies', '_id');

        if (!survey) {
            return res.status(404).json({
                error: 'Survey not found'
            });
        }

        const categoryIds = survey.competencies.map(comp => comp._id);
        const competencies = await Category.find({
            _id: {
                $in: categoryIds
            }
        });

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

        if (!assignCompetencies || assignCompetencies.length === 0) {
            return res.status(404).json({
                error: 'No competencies found for the given survey'
            });
        }

        // Fetch unique questions from assignCompetencies
        const questionsArray = assignCompetencies.map(ac => ac ?.question_id);
        const questions = Array.from(new Set(questionsArray.map(q => q ?._id)))
            .map(id => questionsArray.find(q => q ?._id.equals(id)));

        // Fetch participants for the survey
        const participants = await SurveyParticipant.find({
            survey_id
        });

        // Fetch answers for all participants
        const participantAnswers = [];
        // Process Manager (Supervisor)
        const managerAnswers = await SurveyAnswers.findOne({
            participant_id: survey.manager._id
        });
        if (managerAnswers && managerAnswers.answers) {
            participantAnswers.push({
                answers: managerAnswers.answers
            });
        }
        for (const participant of participants) {
            const participantAnswer = await SurveyAnswers.findOne({
                participant_id: participant._id
            });
            if (participantAnswer && participantAnswer.answers) {
                participantAnswers.push({
                    answers: participantAnswer.answers
                });
            }
        }

        // Calculate category averages
        const {
            report,
            topStrength,
            developmentalOpportunity
        } = calculateCategoryAverages(assignCompetencies, competencies, questions, participantAnswers);

        return res.status(200).json({
            report,
            topStrength,
            developmentalOpportunity
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while generating the report'
        });
    }
};

const generateSummary = async (survey_id,report) => {
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
            const {
                questionText,
                answerText,
                participant
            } = answer;
            const {
                type: participantType
            } = participant;

            if (!result[questionText]) {
                result[questionText] = {};
            }

            if (!result[questionText][participantType]) {
                result[questionText][participantType] = [];
            }

            result[questionText][participantType].push(answerText);
        });

        // Step 3: Format result to match desired output
        const formattedResult = Object.keys(result).reduce((acc, questionText) => {
            const questionData = result[questionText];
            const formattedQuestionData = {
                question: questionText,

                answers: {}
            };

            Object.keys(questionData).forEach(participantType => {
                formattedQuestionData.answers[participantType] = questionData[participantType].reduce((typeAcc, entry, ansIndex) => {
                    typeAcc[`Ans${ansIndex + 1}`] = entry;
                    return typeAcc;
                }, {});
            });

            acc.push(formattedQuestionData);
            return acc;
        }, []);

        try {
            // let prompt5 = `Generate a 2-3 sentence summary from the open-ended question 1 looking for common themes. Add 2-3 additional sentences summarizing any gaps you notice in themes between the self (Looped Lead) and other participants/raters. 
            // The JSON structure should be an array of objects like this:
            // Question:
            // Total Summary:
            // Self:
            // Direct Report:
            // Teammate:
            // Supervisor:
            // Other: 
            // Here is the data you need to summarize:
            // ${JSON.stringify(formattedResult)}`;
            
            // let prompt5= `"Analyze the following survey results for each question:\n\n"` + JSON.stringify(formattedResult) + `"\n\n" .
            //     "For each question, generate a 2-3 sentence summary of the feedback. Then add 2-3 additional sentences identifying any gaps between the self-assessment and feedback from other participants/raters from each respondent type (Self, Direct Report, Teammate, Supervisor, Other) and identify any gaps between the self-assessment and feedback from others. The responses should be structured as follows without any additional headings or formatting:\n\n" .
            //     "1. What are the strengths and skills that make this person most effective?\n" .
            //     "Self: [Self-assessment summary]\n" .
            //     "Direct Report: [Direct Report summary]. Include any gaps between the perception of the self and direct reports.\n" .
            //     "Teammate: [Teammate summary]. Include any gaps between the perception of the self and teammates.\n" .
            //     "Supervisor: [Supervisor summary]. Include any gaps between the perception of the self and supervisor.\n" .
            //     "Other: [Other summary]. Include any gaps between the perception of the self and other respondents.\n\n" .
            //     "2. What suggestions do you have to make this person a stronger performer and more effective?\n" .
            //     "Self: [Self-assessment summary, if available]\n" .
            //     "Direct Report: [Direct Report summary, if available]. Include any gaps between the perception of the self and direct reports.\n" .
            //     "Teammate: [Teammate summary, if available]. Include any gaps between the perception of the self and teammates.\n" .
            //     "Supervisor: [Supervisor summary , if available]. Include any gaps between the perception of the self and supervisor.\n" .
            //     "Other: [Other summary , if available]. Include any gaps between the perception of the self and other respondents.\n\n" .
            //     "3. Other comments?\n" .
            //     "Self: [Self-assessment summary , if available]\n" .
            //     "Direct Report: [Direct Report summary , if available]. Include any gaps between the perception of the self and direct reports.\n" .
            //     "Teammate: [Teammate summary , if available]. Include any gaps between the perception of the self and teammates.\n" .
            //     "Supervisor: [Supervisor summary , if available]. Include any gaps between the perception of the self and supervisor.\n" .
            //     "Other: [Other summary , if available]. Include any gaps between the perception of the self and other respondents.\n\n" .
            //     "Ensure that the response is in plain text without extra headings, bullet points, or other formatting."`;
            
            // const response = await openai.chat.completions.create({
            //   model: 'gpt-4o',
            //     messages: [
            //     {role: 'system', content:'You are an AI assistant that helps analyze survey results.'},
            //     { role: 'user', content: prompt5 }
            //   ]
            // });
            
            const resultsJson = JSON.stringify(formattedResult);

            // Create the different prompts
            const questionSummary = 
                `Analyze the following survey results for each question:\n\n${resultsJson}\n\n` +
                "For each question, generate a 2-3 sentence summary of the feedback. Then add 2-3 additional sentences identifying any gaps between the self-assessment and feedback from other participants/raters from each respondent type (Self, Direct Report, Teammate, Supervisor, Other) and identify any gaps between the self-assessment and feedback from others. The responses should be structured as follows without any additional headings or formatting:\n\n" +
                "1. What are the strengths and skills that make this person most effective?\n" +
                "Self: [Self-assessment summary]\n" +
                "Direct Report: [Direct Report summary]. Include any gaps between the perception of the self and direct reports.\n" +
                "Teammate: [Teammate summary]. Include any gaps between the perception of the self and teammates.\n" +
                "Supervisor: [Supervisor summary]. Include any gaps between the perception of the self and supervisor.\n" +
                "Other: [Other summary]. Include any gaps between the perception of the self and other respondents.\n\n" +
                "2. What suggestions do you have to make this person a stronger performer and more effective?\n" +
                "Self: [Self-assessment summary, if available]\n" +
                "Direct Report: [Direct Report summary, if available]. Include any gaps between the perception of the self and direct reports.\n" +
                "Teammate: [Teammate summary, if available]. Include any gaps between the perception of the self and teammates.\n" +
                "Supervisor: [Supervisor summary, if available]. Include any gaps between the perception of the self and supervisor.\n" +
                "Other: [Other summary, if available]. Include any gaps between the perception of the self and other respondents.\n\n" +
                "3. Other comments?\n" +
                "Self: [Self-assessment summary, if available]\n" +
                "Direct Report: [Direct Report summary, if available]. Include any gaps between the perception of the self and direct reports.\n" +
                "Teammate: [Teammate summary, if available]. Include any gaps between the perception of the self and teammates.\n" +
                "Supervisor: [Supervisor summary, if available]. Include any gaps between the perception of the self and supervisor.\n" +
                "Other: [Other summary, if available]. Include any gaps between the perception of the self and other respondents.\n\n" +
                "Ensure that the response is in plain text without extra headings, bullet points, or other formatting.";
        
            const smartPlan = 
                `Based on the following survey results and developmental suggestions, generate two SMART plans. Each plan should be concise and actionable, formatted as a numbered list. Ensure that each plan includes specific goals, measurable outcomes, achievable steps, relevance to the role, and a timeline. The response should be in plain text without extra headings, bullet points, or other formatting and 2 lines only.\n\n` +
                `Survey Results:\n${resultsJson}\n\n` +
                "The responses should be structured as follows:\n" +
                "1. [First SMART plan with specific, measurable, achievable, relevant, and time-bound goals.]" +
                "2. [Second SMART plan with different specific, measurable, achievable, relevant, and time-bound goals.]";
        
            const strengthsPrompt = 
                `Based on the following survey results, identify the top 3 competencies and provide them as a comma-separated list. The response should be in plain text without extra headings, bullet points, or other formatting and 1 line only and include 'and' before the last competencies.\n\n` +
                `Survey Results:\n${resultsJson}`;
        
            const smartPlanOpportunities = 
                `Based on the following survey results and developmental suggestions, generate two development opportunities. Each development opportunity should be concise and actionable, formatted as a numbered list. Ensure that each plan includes specific goals, measurable outcomes, achievable steps, relevance to the role, and a timeline. The response should be in plain text without extra headings, bullet points, or other formatting and 2 lines only.\n\n` +
                `Survey Results:\n${resultsJson}\n\n` +
                "The responses should be structured as follows:\n" +
                "1. [First development opportunity with specific, measurable, achievable, relevant, and time-bound goals.]" +
                "2. [Second development opportunity with different specific, measurable, achievable, relevant, and time-bound goals.]";
        
            // Call OpenAI API for each of the prompts
            let questionSummary1 = await openaiAnalyzeResults(questionSummary);
            let smartPlan1 = await openaiAnalyzeResults(smartPlan);
            let strengthsPrompt1 = await openaiAnalyzeResults(strengthsPrompt);
            let smartPlanOpportunities1 = await openaiAnalyzeResults(smartPlanOpportunities);
        
            // Split each section by new line
            let analysis = {};
            analysis['question_summary'] = parseQuestionSummary(questionSummary1);
            analysis['smart_plan'] = splitByNewLine(smartPlan1);
            analysis['strengths_prompt'] = splitByNewLine(strengthsPrompt1);
            analysis['smart_plan_opportunities'] = splitByNewLine(smartPlanOpportunities1);
 
        let parsedGoals1 = await saveOrUpdateSurveyReport(survey_id, analysis, "summaries")

            return  parsedGoals1;
        } catch (error) {
            console.error(`Error generating summary for:`, error);
            return {
                // ...formattedResult[prompt1.question],
                "Total Summary": "Error generating summary"
            };
            }
            
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
};
const splitByNewLine = (str) => {
   return typeof str === 'string' ? str.split('.\n') : '';
  
    
};
const parseQuestionSummary = (str) => {
   let data =typeof str === 'string' ? str.split('\n') : '';

    const sectionMappings = {
        '1. What are the strengths': 'strengthsAndSkills',
        '2. What suggestions': 'suggestionsForImprovement',
        '3. Other comments?': 'otherComments'
    };
    
    const parsedData = {
        
            strengthsAndSkills: [],
            suggestionsForImprovement: [],
            otherComments: []
        
    
    };

    let section = null;

    data.forEach((line) => {
        // Check if the line starts with a question that maps to a section
        for (const questionStart in sectionMappings) {
            if (line.startsWith(questionStart)) {
                section = sectionMappings[questionStart]; // Set the section based on the mapping
                return; // Exit the loop once the section is found
            }
        }

        // Handle role-based lines
        const roleMapping = ['Self', 'Direct Report', 'Teammate', 'Supervisor', 'Other'];
        if (roleMapping.some(role => line.startsWith(`${role}:`))) {
            const [role, summary] = line.split(': ');
            if (section) {
                parsedData[section].push({
                    role: role.trim(),
                    summary: summary ? summary.trim() : `[${role.trim()} summary not provided]`
                });
            }
        }
    });

    

    return parsedData;
};


const analyzeData = async (data) => {
    const parsedData = {
        questionSummary: {
            strengthsAndSkills: [],
            suggestionsForImprovement: [],
            otherComments: []
        },
        smartPlan: [],
        strengthsPrompt: [],
        smartPlanOpportunities: []
    };

    // Check for the various sections
    let section = null;
    data.forEach((line) => {
        if (line.startsWith('1. What are the strengths')) {
            section = 'strengthsAndSkills';
        } else if (line.startsWith('2. What suggestions')) {
            section = 'suggestionsForImprovement';
        } else if (line.startsWith('3. Other comments?')) {
            section = 'otherComments';
        } else if (
            line.startsWith('Self:') || 
            line.startsWith('Direct Report:') || 
            line.startsWith('Teammate:') || 
            line.startsWith('Supervisor:') || 
            line.startsWith('Other:')
        ) {
            const [role, summary] = line.split(': ');
            if (section && summary) {
                parsedData.questionSummary[section].push({
                    role: role.trim(),
                    summary: summary.trim()
                });
            }
        }
    });

    return parsedData;
};
async function openaiAnalyzeResults(prompt) {
 const response = await openai.chat.completions.create({
              model: 'gpt-4o',
                messages: [
                {role: 'system', content:'You are an AI assistant that helps analyze survey results.'},
                { role: 'user', content: prompt }
              ]
            });

    return response?.choices?.[0]?.message?.content
}
function extractJsonFromMarkdown(content) {
    // Remove the Markdown code block formatting
    const jsonString = content
        .replace(/```\n/, '') // Remove the opening code block
        .replace(/\n```$/, ''); // Remove the closing code block

    // Parse the JSON string to an object
    try {
        const jsonData = JSON.parse(jsonString);
        return jsonData;
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return null;
    }
}


const saveOrUpdateSurveyReport=async (surveyId, responseData,type) =>{
    try {
        // Define options for updating or creating a new document
        const options = {
            new: true, 
            upsert: true 
        };
        let keyStr = "";

        if (type == "summaries") {
            keyStr = "response_Data";
        } else if (type == "samrtgoals") {
            keyStr = "samrtgoals";
        }
        
        let updateObj = {};
        updateObj[keyStr] = responseData;
        
        // Perform the findOneAndUpdate operation
        const updatedReport = await SurveyReport.findOneAndUpdate(
            { survey_id: surveyId },
          {response_Data:responseData},
            options // Options
        );

        return updatedReport;
    } catch (error) {
        console.error('Error saving or updating survey report:', error);
        throw error; // Optionally rethrow the error to be handled by the calling function
    }
}



exports.getSmartGoals = async (req, res) => {
    const {
        survey_id,
        dev_opp,top_str
    } = req.params;
    const surveyReport = await SurveyReport.findOne( { survey_id: survey_id } );
    console.log(surveyReport?.response_Data, dev_opp, top_str);
    let prompt = `Write 2,2 SMART goals (make sure they are measurable with specific metrics, actually possible for the average person, and use specific dates or frequencies with a timeframe) for this employee to achieve in the next 30 days based on their top  strength and developmental opportunity.
                format:
                
                Strength: ${top_str}

                Summary: 

                SMART Plan:

                development_opportunities : ${dev_opp}

                Summary: 

                SMART Plan:

                here the question answer sumarry
                
                ${JSON.stringify(surveyReport?.response_Data)}
                
                 give me the response in the json `;
             
    
    if (!surveyReport?.samrtgoals) {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'user', content: prompt }
            ]
        });

        let samrtgoals = response.choices[0].message.content;
        
        samrtgoals = extractJsonFromMarkdown(samrtgoals)

        let parsedGoals1 = await saveOrUpdateSurveyReport(survey_id, samrtgoals, "samrtgoals")
        return res.status(200).json({
            'samrtgoals': samrtgoals,
         
        });

    }else {
        // return res.status(200).json({
        //     'samrtgoals': surveyReport?.samrtgoals,
         
        // });
        let samrtgoals = `{
                "strength": {
                "name": "Problem Solving",
                "summary": "You excel at identifying issues, analyzing potential solutions, and implementing effective resolutions. Your ability to break down complex problems into manageable parts and use logical strategies ensures that challenges are overcome efficiently.",
                "SMART_Plan": [
                    {
                    "Specific": "Improve verbal communication skills by leading three team meetings within the next 30 days.",
                    "Measurable": "Collect feedback from team members after each meeting, aiming for a 10% improvement in clarity and engagement scores.",
                    "Achievable": "Prepare thoroughly for each meeting and implement feedback from previous sessions.",
                    "Relevant": "Enhances leadership and communication effectiveness.",
                    "Time-bound": "Complete three meetings by the end of the 30-day period."
                    },
                    {
                    "Specific": "Enhance written communication by crafting weekly summary reports of team activities and progress.",
                    "Measurable": "Produce four reports in the next 30 days, with a focus on clear and concise information sharing.",
                    "Achievable": "Allocate time each week specifically for report creation and review.",
                    "Relevant": "Ensures the team is informed and aligned on progress and objectives.",
                    "Time-bound": "First report to be completed within the first week and subsequently weekly thereafter."
                    }
                ]
                },
                "development_opportunity": {
                "name": "Communication",
                "summary": "Your current communication skills have room for improvement, particularly in areas such as articulating ideas clearly, active listening, and providing constructive feedback. Strengthening these skills will enhance overall team collaboration and productivity.",
                "SMART_Plan": [
                    {
                    "Specific": "Focus on improving both verbal and written communication skills by engaging in active listening exercises, seeking opportunities for public speaking, and participating in writing workshops.",
                    "Measurable": "Set a goal to receive at least three pieces of constructive feedback on your communication skills from peers or supervisors each month and track your progress and improvements.",
                    "Achievable": "Identify a mentor who excels in communication to guide you and provide regular feedback. Additionally, consider enrolling in relevant courses or workshops.",
                    "Relevant": "Improving communication skills will enhance your ability to work with colleagues and stakeholders, ultimately contributing to more effective teamwork and project success.",
                    "Time-bound": "Aim to see measurable improvement in your communication skills within the next three months, with regular check-ins with your mentor or manager to assess progress."
                    },
                    {
                    "Specific": "Review and edit emails before sending to ensure clear and concise messaging, aiming for a 20% reduction in word count.",
                    "Measurable": "Compare word counts of emails sent over the next 30 days to previous emails.",
                    "Achievable": "Use bullet points and simplify language to make communication clearer.",
                    "Relevant": "Concise communication will lead to more efficient team interactions.",
                    "Time-bound": "Achieve this goal within 30 days."
                    }
                ]
                }
            }`;
              
            let parsedGoals = JSON.parse(samrtgoals);
            // let parsedGoals1 = await saveOrUpdateSurveyReport(survey_id, parsedGoals, "samrtgoals")
        
            return res.status(200).json({
                'samrtgoals': parsedGoals,
             
            });
    }
    
          

}