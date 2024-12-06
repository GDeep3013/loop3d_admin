const Survey = require('../models/Survey');
const SurveyParticipant = require('../models/SurveyParticipantModel');
const User = require('../models/User')
const Role = require('../models/Role')
const AssignCompetency = require('../models/AssignCompetencyModel');
const Category = require('../models/CategoryModel')
const SurveyReport = require('../models/SurveyReport')
const SurveyImage = require('../models/SurveyChartImage');
const Goals = require('../models/Goals');

const fs = require('fs');
const path = require('path');

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
        await check('surveyData.loop_leads.*.firstName').not().isEmpty().withMessage(' First Name is required').run(req);
        await check('surveyData.loop_leads.*.lastName').not().isEmpty().withMessage('Last Name is required').run(req);
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
            const {firstName, lastName, email} = lead;

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

                user = new User({
                    first_name:firstName,
                    last_name:lastName,
                    email,
                    role: role?._id,
                    password: hashedPassword,
                    organization: manager?.organization || null,
                    created_by: surveyData.mgr_id
                });

                await user.save();

            }
            let name=firstName +' '+  lastName
            // Create the survey and associate it with the user
            const survey = new Survey({
                name: surveyData.name,
                manager: surveyData.mgr_id,
                loop_lead: user._id,
                organization: manager?.organization,
                competencies: surveyData.competencies || [],
            });

            const savedSurvey = await survey.save();
            let admin_panel_url = `${process.env.ADMIN_PANEL}/create-password?token=${user?._id}`;
            let url = `${process.env.ADMIN_PANEL}/loop-lead/participant/create/` + savedSurvey?._id
            let first_name = firstName
            let last_name = lastName
            let summary_url = `${process.env.ADMIN_PANEL}/survey-summary?survey_id=` + savedSurvey?._id
            

            sendEmail('createPasswordMail', {email,first_name,last_name,admin_panel_url})

            
            await sendEmail('sendLoopLeadLink', {
                name,
                email,
                url
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
            // await check('participants.*.p_last_name').not().isEmpty().withMessage('Participant last name is required').run(req),
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

            if (savedParticipant) {
                const survey1 = await Survey.findById(survey_id);
                if (survey1) {
                    // Ensure total_invites is a number
                    if (survey1.total_invites === null || typeof survey1.total_invites !== 'number') {
                        survey1.total_invites = 0;
                    }
                    survey1.total_invites += 1;
                    await survey1.save();
                }
            }
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
            limit = 10,
            sortField,
            sortOrder
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
        let sortBy= { createdAt: -1 }
         if (sortField && sortOrder) {
             const order = sortOrder === 'asc' ? 1 : -1;
            sortBy = { [sortField]: order }
        }
        // Find the surveys with pagination and populate related fields
        const surveys = await Survey.find(query)
            .populate('manager', 'first_name last_name email')
            .populate('loop_lead', 'first_name last_name email')
            .populate('organization', 'name')
            .sort(sortBy)
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
        const surveys = await Survey.find(query).sort({ createdAt: -1 })
            .populate('loop_lead', 'first_name last_name email') // Populate loop_lead_id with name and email fields
            .populate('manager', 'first_name last_name email') // Populate mgr_id with name and email fields
            .populate('organization', 'name') // Populate organization_id with name
            .populate('competencies', '_id'); // Populate competencies with _id (Category)

        if (!surveys || surveys.length === 0) {
            return res.status(404).json({
                error: 'Survey not found'
            });
        }

        const org_id1 = surveys.flatMap(survey => survey.organization._id)
        const manager_id =surveys.flatMap(survey => survey.manager._id)

        // Step 2: Fetch related AssignCompetency data for the survey(s)
        const categoryIds = surveys.flatMap(survey => survey.competencies.map(comp => comp._id));
        const assignCompetencies = await AssignCompetency.find({ organization_id: org_id1, user_id:manager_id,question_id: { $ne: null } 
             // Ensure question_id is not null for both cases
        }).populate({
            path: 'question_id',
            select: 'questionText questionType options', // Select necessary fields
            populate: {
                path: 'options',
                select: 'text weightage' // Select specific fields for options
            }
        });
        const questionsArray = assignCompetencies.map(ac => ac?.question_id);

       
        // Optionally remove duplicates if needed (e.g., if multiple entries for the same question)
        const questions = Array.from(new Set(questionsArray.map(q => q?._id )))
            .map(id => {
                return questionsArray.find(q => q?._id.equals(id) );
            });


        const competencies = await Category.find({
            _id: {
                $in: categoryIds
            }
        })
        console.log(competencies,'competencies');
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

        if (participant_id && survey_id) {
            surveyQuery._id = survey_id;
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
            let surveys = await Survey.find(surveyQuery).sort({ createdAt: -1 })
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
            if (survey_id && participant_id) {
                participantQuery.survey_id = survey_id;
                participantQuery._id = participant_id;
            }

            let participants = await SurveyParticipant.find(participantQuery).sort({ createdAt: -1 })
                .populate({
                    path: 'survey_id',
                    select: 'name survey_status total_invites report_gen_date',
                    populate: {
                        path: 'loop_lead',
                        select: 'first_name last_name'
                    }
                })

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
        // Find the participant by ID first
        const participant = await SurveyParticipant.findById(req.params.id);

        if (!participant) {
            return res.status(404).json({
                error: "Survey Participant not found"
            });
        }

        // Retrieve the survey ID from the participant
        const survey_id = participant.survey_id; // Assuming the participant has a reference to the survey

        // Decrement the total_invites count in the survey
        const survey = await Survey.findById(survey_id);
        if (survey) {
            // Ensure total_invites is a number and not null
            if (survey.total_invites === null || typeof survey.total_invites !== 'number') {
                survey.total_invites = 0;
            }

            // Decrement total_invites, but ensure it doesn't go below 0
            survey.total_invites = Math.max(0, survey.total_invites - 1);
            await survey.save();
        }

        // Delete the participant
        await SurveyParticipant.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Survey Participant deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const processParticipantAnswers = (participant, answers, participantType, assignCompetencies, competencies, questions, report) => {
    // Initialize report categories if not already initialized
    if (!report.categories) {
        report.categories = {};
    }

    if (!report.resultArray) {
        report.resultArray = {}; // Initialize resultArray if it doesn't exist
    }

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
                                    textAnswers: [],
                                    averageWeightage: 0
                                },
                                'Direct Report': {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: [],
                                    averageWeightage: 0
                                },
                                Teammate: {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: [],
                                    averageWeightage: 0
                                },
                                Supervisor: {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: [],
                                    averageWeightage: 0
                                },
                                Other: {
                                    totalQuestions: 0,
                                    totalWeightage: 0,
                                    textAnswers: [],
                                    averageWeightage: 0
                                }
                            };
                        }

                        // Increment totalQuestions and totalWeightage for the participantType
                        if (!answer.answer) {
                            report.categories[categoryName][participantType].totalQuestions += 1;
                        } else {
                            if (question?.questionType === 'OpenEnded') {
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

                        // Initialize the result array for the category if it doesn't exist
                        if (!report.resultArray[categoryName]) {
                            report.resultArray[categoryName] = []; // Create an array for the category
                        }

                        // Prepare entry for the question
                        const entry = report.resultArray[categoryName].find(e => e.question === question.questionText) || {
                            question: question.questionText,
                            self_average: 0,
                            total_other_weightage: 0, // Placeholder for total weightage of others
                            total_other_responses: 0 // To track total responses for others
                        };

                        if (!answer.answer) {
                            if (participantType === 'Self') {
                                entry.self_average += weightage; // Accumulate self average
                            } else {
                                entry.total_other_weightage += weightage; // Accumulate total weightage for others
                                entry.total_other_responses += 1; // Count responses from others
                            }

                            // Add entry to the result array for the category
                            if (!report.resultArray[categoryName].some(e => e.question === question.questionText)) {
                                report.resultArray[categoryName].push(entry); // Add entry if it doesn't exist
                            }
                        }
                    }
                }
            }
        }

        // Calculate average for others in each entry
        for (const category in report.resultArray) {
            for (const entry of report.resultArray[category]) {
                if (entry.total_other_responses > 0) {
                    entry.other_average = entry.total_other_weightage / entry.total_other_responses; // Calculate average for others
                } else {
                    entry.other_average = 0; // No responses means average is zero
                }
            }
        }
    }

    // Optional: Sort the result array by category name if needed
    Object.keys(report.resultArray).forEach(category => {
        report.resultArray[category].sort((a, b) => a.question.localeCompare(b.question));
    });
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
        if (!survey_report?.response_Data || req?.query?.action == "ReGenerate") {
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
const deleteImageFromFileSystem = (filename) => {
    const filePath = path.join(__dirname, '../../public/uploads', filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
const generateSummary = async (survey_id,report) => {
        try {
            let existingSurveyImage = await SurveyImage.findOne({ survey_id });
            if (existingSurveyImage) {
                if (existingSurveyImage.chart_image) {
                        
                    deleteImageFromFileSystem(existingSurveyImage.chart_image);
                }
                existingSurveyImage.summaries_by_competency?.chartRef1?.forEach((filename) => {
                    deleteImageFromFileSystem(filename);
                });
                existingSurveyImage.summaries_by_competency?.chartRef2?.forEach((filename) => {
                    deleteImageFromFileSystem(filename);
                });
                await SurveyImage.findOneAndDelete({survey_id})
            }
            
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


const processSmartPlanData = async (survey_id, smartPlanData) => {
    try {
        const smartPlan = smartPlanData?.response_Data?.smart_plan;
        const smartPlanOpportunities = smartPlanData?.response_Data?.smart_plan_opportunities;
        const strengthsPrompt = smartPlanData?.response_Data?.strengths_prompt[0];  // Assuming only one entry
        // Parse strengths prompt to get the competencies
        const competencies = strengthsPrompt.split(',').map(str => str.trim());
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
        // Search for matching competencies in the database (Category collection)
        const regexArray = competencies.map(competency => ({
            category_name: {
                $regex: competency,
                $options: 'i'
            }
        }));

        return regexArray
        // Search for matching categories in the database using regex
        const categories = await Category.find({
            $or: regexArray  // Use $or to match any of the competencies
        });
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);

        // Function to save SMART plan or opportunities to the Goals collection
        const saveGoal = async (goalText, competencyId) => {
            const newGoal = new Goals({
                specific_goal: goalText,
                survey_id: survey_id,
                dead_line: deadline,
                competency: competencyId
            });
            return await newGoal.save();
        };

        // Loop through and save each SMART plan entry
        for (let i = 0; i < smartPlan.length; i++) {
            // Save each SMART plan under the first matching competency
            await saveGoal(smartPlan[i], categories[0]?._id);
        }

        // Loop through and save each SMART plan opportunity
        for (let i = 0; i < smartPlanOpportunities.length; i++) {
            // Save each SMART opportunity under the second matching competency (if available)
            await saveGoal(smartPlanOpportunities[i], categories[1]?._id || categories[0]?._id);
        }

        return { message: 'Goals and opportunities saved successfully' };

    } catch (error) {
        console.error('Error saving SMART plan data:', error);
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
        if (updatedReport) {
            await Survey.updateOne(
                { _id: surveyId },           
                {$set: { report_gen_date: Date.now() }}
            );
            const survey = await Survey.findById(surveyId)
            .populate('loop_lead', 'first_name last_name email') // Populate loop_lead_id with name and email fields
            .populate('manager', 'first_name last_name email') // Populate mgr_id with name and email fields
            .populate('organization', 'name') // Populate organization_id with name
            .populate('competencies', '_id');
            let summary_url = `${process.env.ADMIN_PANEL}/survey-summary?survey_id=` + survey?._id
            let name = survey?.loop_lead?.first_name
            let email = survey?.loop_lead?.email

            await sendEmail('sendSumaryReport', {
                name,
                email,
                summary_url
            });
        }

        return updatedReport;
    } catch (error) {
        console.error('Error saving or updating survey report:', error);
        throw error; // Optionally rethrow the error to be handled by the calling function
    }
}



exports.getSmartGoals = async (req, res) => {
    const { survey_id, dev_opp, top_str } = req.params;

    try {
        // Find or create a survey report
        const surveyReport = await SurveyReport.findOne({ survey_id: survey_id });

        if (!surveyReport) {
            return res.status(404).json({ message: 'Survey report not found' });
        }

        const smartPlan = surveyReport?.response_Data?.smart_plan;
        const smartPlanOpportunities = surveyReport?.response_Data?.smart_plan_opportunities;


        const regexArray = [
            { category_name: { $regex: dev_opp, $options: 'i' } },
            { category_name: { $regex: top_str, $options: 'i' } }
        ];

        const categories = await Category.find({ $or: regexArray });


        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30); // 30 days deadline for SMART goals

        // Function to create or update SMART goals in the Goals collection
        const saveOrUpdateGoal = async (goalText, competencyId, type) => {
            const goal = await Goals.findOneAndUpdate(
                { survey_id: survey_id, specific_goal: goalText },
                { 
                    specific_goal: goalText,
                    dead_line: deadline,
                    competency: competencyId,
                    goal_type: type // New field to track if it's a SMART plan or opportunity
                },
                { upsert: true, new: true } // Create if it doesn't exist, update if it does
            );
            return goal;
        };

        // Loop through and save each SMART plan entry under the first matching category (Top Strength)
        for (let i = 0; i < smartPlan.length; i++) {
            const splitPlans = smartPlan[i].split(/(?=\d+\.\s)/); // Split based on numbered list
            for (let part of splitPlans) {
                const trimmedPart = part.trim(); // Trim spaces
                if (trimmedPart.length > 50) {
                    await saveOrUpdateGoal(trimmedPart, categories[1]?._id || categories[0]?._id, 'Strength');
                }
            }
        }
        
        // Loop through and save each SMART plan opportunity
        for (let i = 0; i < smartPlanOpportunities.length; i++) {
            const splitOpportunities = smartPlanOpportunities[i].split(/(?=\d+\.\s)/); // Split based on numbered list
            for (let part of splitOpportunities) {
                const trimmedPart = part.trim(); // Trim spaces
                if (trimmedPart.length > 50) {
                    await saveOrUpdateGoal(trimmedPart, categories[0]?._id, 'Opportunity');
                }
            }
        }

        res.status(200).json({ message: 'SMART goals saved/updated successfully' });

    } catch (error) {
        console.error('Error saving SMART plan data:', error);
        res.status(500).json({ message: 'Error saving SMART plan data' });
    }
};   


exports.test = async (req, res) => {
    try {
        const updatedSurvey = await Survey.findByIdAndUpdate(
            '67333bd92bf2bf612c8918c6', 
            { survey_status: 'completed' },
        );

        if (!updatedSurvey) {
            return res.status(404).json({ message: 'Survey not found' });
        }

        res.status(200).json({ message: 'Survey updated successfully', data: updatedSurvey });
    } catch (error) {
        res.status(500).json({ message: 'Error updating survey', error });
    }
};