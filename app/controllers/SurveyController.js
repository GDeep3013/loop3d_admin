const Survey = require('../models/Survey');
const SurveyParticipant = require('../models/SurveyParticipantModel');
const User = require('../models/User')
const Role = require('../models/Role')
const AssignCompetency = require('../models/AssignCompetencyModel');
const Category = require('../models/CategoryModel')
const { sendEmail } = require('../../emails/sendEmail');
const SurveyAnswers = require('../models/SurveyAnswers');
const bcrypt = require('bcrypt');

const { check, validationResult } = require('express-validator');


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
        await check('surveyData.loop_leads').isArray({ min: 1 }).withMessage('At least one loop lead is required').run(req);
        await check('surveyData.loop_leads.*.email').isEmail().withMessage('Invalid email').run(req);
        await check('surveyData.loop_leads.*.name').not().isEmpty().withMessage('Name is required').run(req);
        await check('surveyData.competencies').isArray().withMessage('Competencies must be an array').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { surveyData } = req.body;
        const loopLeads = surveyData.loop_leads;
        const manager = await User.findById(surveyData.mgr_id);
        let savedSurveys = [];

        for (let lead of loopLeads) {
            const { name, email} = lead;

            // Check if the user already exists by email
            let user = await User.findOne({ email: email });
            let password = generateRandomPassword(10);
            const hashedPassword = await bcrypt.hash(password, 10);
            if (!user) {
                // Create a new loop lead user
                let role = await Role.findOne({ type: "looped_lead" });
               
                // Create the user object
                console.log(password, hashedPassword);
                user = new User({
                    first_name:name, 
                    email,
                    role: role?._id,
                    password: hashedPassword,
                    organization_id: manager?.organization_id || null,
                    created_by: surveyData.mgr_id
                });

                await user.save();
             
            } 

            // Create the survey and associate it with the user
            const survey = new Survey({
                name: surveyData.name,
                manager:surveyData.mgr_id,
                loop_lead: user._id,
                organization_id: manager?.organization_id,
                competencies: surveyData.competencies || [] 
            });

            const savedSurvey = await survey.save();
            let admin_panel_url = `${process.env.ADMIN_PANEL}/forget-password`;
            let url = `${process.env.ADMIN_PANEL}/lead-dashboard?token=` + savedSurvey?._id       
            let first_name = name
            let summary_url=`${process.env.ADMIN_PANEL}/survey-summary?survey_id=`+ savedSurvey?._id
            await sendEmail('sendCredentialMail', { first_name, email,password ,admin_panel_url }); 
            await sendEmail('sendLoopLeadLink', { name, email, url });
            await sendEmail('sendSumaryReport', { name, email, summary_url });
                       
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createSurveyParticipants = async (req, res) => {
    try {
        await check('participants').isArray({ min: 1 }).withMessage('Participants array is required and cannot be empty').run(req),
        await check('survey_id').not().isEmpty().withMessage('Survey ID is required for each participant').run(req),
        await check('participants.*.p_first_name').not().isEmpty().withMessage('Participant first name is required').run(req),
        await check('participants.*.p_last_name').not().isEmpty().withMessage('Participant last name is required').run(req),
        await  check('participants.*.p_type').not().isEmpty().withMessage('Participant type is required').run(req),

        await  check('participants.*.p_email').isEmail().withMessage('Invalid email address').run(req)
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { participants,survey_id } = req.body;

    

        let savedParticipants = [];
        let loop_lead_name = '';
        let mrg_name = ''
        let loop_lead_email = '';
        let mrg_email = ''
        let url = ''
        let loop_lead_id = ''
        let mrg_id=''
        await sendEmail('sendMailToParticipant', { name, p_email, url });
        for (let participant of participants) {
            const { p_first_name, p_last_name, p_email,p_type } = participant;

            // Create a new SurveyParticipant
            const newParticipant = new SurveyParticipant({
                survey_id,
                p_type,
                p_first_name,
                p_last_name,
                p_email
            });
            
            const savedParticipant = await newParticipant.save();

            const survey= await Survey.findById(survey_id)
            .populate('manager', 'first_name last_name email')
            .populate('loop_lead', 'first_name last_name email');
            
            let name = survey?.loop_lead?.first_name;

            loop_lead_name = survey?.loop_lead?.first_name;
            mrg_name = survey?.manager?.first_name;

            loop_lead_email = survey?.loop_lead?.email;
            mrg_email = survey?.manager?.email;

            loop_lead_id = survey?.loop_lead?._id;
            mrg_id = survey?.manager?._id

            
            let url = `${process.env.FRONT_END_URL}/feedback-survey?survey_id=${survey_id}&participant_id=${savedParticipant?._id}`
            await sendEmail('sendMailToParticipant', { name, p_email, url });
              
            savedParticipants.push(savedParticipant);
        }

        // send feedback form to loopLead
       
        p_email = loop_lead_email;
        let name= loop_lead_name
        url = `${process.env.FRONT_END_URL}/feedback-survey?survey_id=${survey_id}&participant_id=${loop_lead_id}`
        await sendEmail('sendMailToParticipant', { name, p_email, url });

           // send feedback form to Manger
        p_email = mrg_email;
        name= mrg_name
        url = `${process.env.FRONT_END_URL}/feedback-survey?survey_id=${survey_id}&participant_id=${mrg_id}`
        await sendEmail('sendMailToParticipant', { name, p_email, url });

        res.status(201).json({
            status: 'success',
            data: {
                participants: savedParticipants,
                message: 'Survey participants created successfully'
            }
        });
    } catch (error) {
        console.error('Error creating survey participants:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllSurvey = async (req, res) => {
    try {
        let { searchTerm, page = 1, limit = 10 } = req.query;
        const query = {};

        if (searchTerm) {
            query.$or = [
                { survey_status: { $regex: searchTerm, $options: 'i' } },
                { ll_survey_status: { $regex: searchTerm, $options: 'i' } },
                { mgr_survey_status: { $regex: searchTerm, $options: 'i' } }
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
            .populate('organization_id', 'name')
            .skip(skip)
            .limit(limit);

        // Get the total number of surveys
        const totalSurveys = await Survey.countDocuments(query);

        // Calculate total number of pages
        const totalPages = Math.ceil(totalSurveys / limit);

        // Fetch additional details for each survey
        const results = await Promise.all(
            surveys.map(async (survey) => {
                const totalParticipants = await SurveyParticipant.countDocuments({ survey_id: survey._id });
                const completed_survey = await SurveyParticipant.countDocuments({ survey_id: survey._id, survey_status: 'completed' });

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
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getSurveyById = async (req, res) => {
    try {
        const { loop_lead_id, mgr_id, survey_id, org_id } = req.query;

        // Build the query object based on the provided parameters
        let query = {};
        if (loop_lead_id && org_id) query = { loop_lead:loop_lead_id, organization_id: org_id };
        if (mgr_id) query.manager = mgr_id;
        if (loop_lead_id && mgr_id) query = { loop_lead: loop_lead_id, manager: mgr_id };

        if (loop_lead_id) query = { loop_lead: loop_lead_id};

        
        if (survey_id) query._id = survey_id;
  
        // Step 1: Find the survey(s) by the provided ID(s) and populate related fields
        const surveys = await Survey.find(query)
            .populate('loop_lead', 'first_name last_name email') // Populate loop_lead_id with name and email fields
            .populate('manager', 'first_name last_name email') // Populate mgr_id with name and email fields
            .populate('organization_id', 'name') // Populate organization_id with name
            .populate('competencies', '_id'); // Populate competencies with _id (Category)

        if (!surveys || surveys.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        // Step 2: Fetch related AssignCompetency data for the survey(s)
        const categoryIds = surveys.flatMap(survey => survey.competencies.map(comp => comp._id));
        const assignCompetencies = await AssignCompetency.find({ category_id: { $in: categoryIds }, organization_id: null })
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
        
          
                const competencies = await Category.find({ _id: { $in: categoryIds }})

        // Step 3: Merge competencies and assignCompetencies data into the survey(s)
        const results = await Promise.all(surveys.map(async (survey) => {

            const totalParticipants = await SurveyParticipant.countDocuments({ survey_id: survey._id });
            const completed_survey = await SurveyParticipant.countDocuments({ survey_id: survey._id, survey_status: 'completed' });

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
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.getSurveyParticipantsById = async (req, res) => {
    try {
        const { survey_id, participant_id } = req.query;

        if (!survey_id && !participant_id) {
            return res.status(400).json({ error: 'Either survey_id or participant_id is required' });
        }

        // Initialize the query object
        let surveyQuery = {};
        let participantQuery = {};

        // Construct the query for surveys

        if (participant_id) {
            surveyQuery.$or = [
                { loop_lead: participant_id },
                { manager: participant_id }
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
        if (survey_id ||participant_id) {
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
        res.status(404).json({ error: 'No data found' });

    } catch (error) {
        console.error('Error fetching survey participants:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteParticipant = async (req, res) => {
    try {
        const Participant = await SurveyParticipant.findByIdAndDelete(req.params.id);
        if (!Participant) {
            return res.status(404).json({ error: "Survey Participant not found" });
        }
        res.status(200).json({ message: "Survey Participant deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const processParticipantAnswers = (participant, answers, participantType, assignCompetencies, competencies, questions, report) => {
    if (answers) {
        for (const answer of answers) {
            const question = questions.find(q => q._id.equals(answer?.questionId));
            if (question) {
                const assignCompetency = assignCompetencies.find(ac => ac.question_id.equals(question._id));
                if (assignCompetency) {
                    const competency = competencies.find(c => c._id.equals(assignCompetency.category_id));
                    if (competency) {
                        const categoryName = competency.category_name;
                        const selectedOption = question.options.find(option =>
                            option?._id?.toString() === answer?.optionId?.toString()
                        );
                        const weightage = selectedOption ? selectedOption.weightage : (answer?.weightage || 0);

                        // Initialize category for each participant type
                        if (!report.categories[categoryName]) {
                            report.categories[categoryName] = {
                                Self: { totalQuestions: 0, totalWeightage: 0 },
                                'Direct Report': { totalQuestions: 0, totalWeightage: 0 },
                                Teammate: { totalQuestions: 0, totalWeightage: 0 },
                                Supervisor: { totalQuestions: 0, totalWeightage: 0 },
                                Other: { totalQuestions: 0, totalWeightage: 0 }
                            };
                        }

                        // Increment totalQuestions and totalWeightage for the participantType
                        if (!answer.answer) {
                            report.categories[categoryName][participantType].totalQuestions += 1;
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
        const { survey_id } = req.params;

        const survey = await Survey.findById(survey_id)
            .populate('loop_lead', 'first_name last_name email _id')
            .populate('manager', 'first_name last_name email')
            .populate('organization_id', 'name')
            .populate('competencies', '_id');

        if (!survey) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const categoryIds = survey.competencies.map(comp => comp._id);
        const assignCompetencies = await AssignCompetency.find({
            category_id: { $in: categoryIds },
            organization_id: null
        }).populate({
            path: 'question_id',
            select: 'questionText questionType options',
            populate: {
                path: 'options',
                select: 'text weightage'
            }
        });

        const questionsArray = assignCompetencies.map(ac => ac.question_id);
        const questions = Array.from(new Set(questionsArray.map(q => q._id)))
            .map(id => questionsArray.find(q => q._id.equals(id)));

        const competencies = await Category.find({ _id: { $in: categoryIds } });

        const report = {
            surveyDetails: {
                id: survey?._id,
                name: survey.name,
                loop_lead: survey.loop_lead,
                manager: survey.manager,
                organization: survey.organization_id.name,
            },
            categories: {}
        };

        // Initialize categories for all competencies
        competencies.forEach((category) => {
            report.categories[category.category_name] = {
                Self: { totalQuestions: 0, totalWeightage: 0 },
                'Direct Report': { totalQuestions: 0, totalWeightage: 0 },
                Teammate: { totalQuestions: 0, totalWeightage: 0 },
                Supervisor: { totalQuestions: 0, totalWeightage: 0 },
                Other: { totalQuestions: 0, totalWeightage: 0 }
            };
        });

        // Process Loop Lead (Self)
        const loopLeadAnswers = await SurveyAnswers.findOne({ participant_id: survey?.loop_lead?._id });
        processParticipantAnswers(survey.loop_lead, loopLeadAnswers?.answers, 'Self', assignCompetencies, competencies, questions, report);

        // Process Manager (Supervisor)
        const managerAnswers = await SurveyAnswers.findOne({ participant_id: survey.manager._id });
        processParticipantAnswers(survey.manager, managerAnswers?.answers, 'Supervisor', assignCompetencies, competencies, questions, report);

        // Process other participants (Direct Report, Teammate, Other)
        const participants = await SurveyParticipant.find({ survey_id });
        for (const participant of participants) {
            const participantType = participant.p_type || 'Other';
            const participantAnswers = await SurveyAnswers.findOne({ participant_id: participant._id });
            processParticipantAnswers(participant, participantAnswers?.answers, participantType, assignCompetencies, competencies, questions, report);
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

        return res.status(200).json({ report });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while generating the report' });
    }
};

const calculateCategoryAverages = (assignCompetencies, competencies, questions, participantAnswers) => {
    let report = {};
    let topStrength = '';
    let developmentalOpportunity = '';
    let maxAverage = -Infinity;
    let minAverage = Infinity;

    competencies.forEach((competency) => {
        const competencyQuestions = questions.filter(q => 
            assignCompetencies.some(ac => ac.category_id.equals(competency._id) && ac.question_id._id.equals(q._id))
        );

        let totalQuestions = 0;
        let totalWeightage = 0;

        competencyQuestions.forEach(question => {
            // Find all participant answers for this question
            const questionAnswers = participantAnswers
                .map(pa => pa.answers.find(ans => ans?.questionId?.equals(question._id)))
                .filter(Boolean);  // Filter out any undefined answers
        
            // Calculate the total weightage for the question
            questionAnswers.forEach(answer => {
                // Find the selected option in the question's options
                const selectedOption = question.options.find(option => 
                    option?._id?.toString() === answer?.optionId?.toString()
                );
        
                // Get the weightage from the selected option or fallback to answer weightage
                const weightage = selectedOption ? selectedOption.weightage : (answer?.weightage || 0);
        
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

    return { report, topStrength, developmentalOpportunity };
};


exports.generateCompetencyAverageReport = async (req, res) => {
    try {
        const { survey_id } = req.params;

        // Fetch survey details and related data
        const survey = await Survey.findById(survey_id)
            .populate('loop_lead', 'first_name last_name email')
            .populate('manager', 'first_name last_name email')
            .populate('organization_id', 'name')
            .populate('competencies', '_id');

        if (!survey) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const categoryIds = survey.competencies.map(comp => comp._id);
        const competencies = await Category.find({ _id: { $in: categoryIds } });

        const assignCompetencies = await AssignCompetency.find({
            category_id: { $in: categoryIds },
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
            return res.status(404).json({ error: 'No competencies found for the given survey' });
        }

        // Fetch unique questions from assignCompetencies
        const questionsArray = assignCompetencies.map(ac => ac.question_id);
        const questions = Array.from(new Set(questionsArray.map(q => q._id)))
            .map(id => questionsArray.find(q => q._id.equals(id)));

        // Fetch participants for the survey
        const participants = await SurveyParticipant.find({ survey_id });

        // Fetch answers for all participants
        const participantAnswers = [];
        // Process Manager (Supervisor)
        const managerAnswers = await SurveyAnswers.findOne({ participant_id: survey.manager._id });
        if (managerAnswers && managerAnswers.answers) {
            participantAnswers.push({ answers: managerAnswers.answers });
        }
        for (const participant of participants) {
            const participantAnswer = await SurveyAnswers.findOne({ participant_id: participant._id });
            if (participantAnswer && participantAnswer.answers) {
                participantAnswers.push({ answers: participantAnswer.answers });
            }
        }

        // Calculate category averages
        const { report, topStrength, developmentalOpportunity } = calculateCategoryAverages(assignCompetencies, competencies, questions, participantAnswers);

        return res.status(200).json({ report, topStrength, developmentalOpportunity });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while generating the report' });
    }
};
