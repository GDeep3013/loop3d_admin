const Survey = require('../models/Survey');
const SurveyParticipant = require('../models/SurveyParticipantModel');
const User = require('../models/User')
const Role  = require('../models/Role')

const { check, validationResult } = require('express-validator');

// Create Survey and Add Survey Members
exports.createSurvey = async (req, res) => {
    try {
        // Validate request
        await check('surveyData').not().isEmpty().withMessage('surveyData is required').run(req);
        await check('surveyData.name').not().isEmpty().withMessage('Survey name is required').run(req);
        await check('surveyData.mgr_id').not().isEmpty().withMessage('Manager ID (mgr_id) is required').run(req);
        await check('surveyData.loop_leads').isArray({ min: 1 }).withMessage('At least one loop lead is required').run(req);
        await check('surveyData.loop_leads.*.email').isEmail().withMessage('Invalid email').run(req);
        await check('surveyData.loop_leads.*.competencies').isArray().withMessage('Competencies must be an array').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { surveyData } = req.body;
        const loopLeads = surveyData.loop_leads;
        const manager = await User.findById(surveyData.mgr_id);
        let savedSurveys = [];

        for (let lead of loopLeads) {
            const { first_name, last_name, email, competencies } = lead;

            // Check if the user already exists by email
            let user = await User.findOne({ email: email });

            if (!user) {
                // Create a new loop lead user
                let role = await Role.findOne({ type: "looped_lead" });
                
                // Create the user object
                user = new User({
                    first_name,
                    last_name,
                    email,
                    role: role?._id,
                    organization_id: manager?.organization_id || null,
                    created_by: surveyData.mgr_id
                });

                await user.save();
            } 

            // Create the survey and associate it with the user
            const survey = new Survey({
                name: surveyData.name,
                mgr_id: surveyData.mgr_id,
                loop_lead_id: user._id,
                organization_id: manager?.organization_id,
                competencies: competencies || [] 
            });

            const savedSurvey = await survey.save();
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
        await  check('participants.*.p_last_name').not().isEmpty().withMessage('Participant last name is required').run(req),
        await  check('participants.*.p_email').isEmail().withMessage('Invalid email address').run(req)
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { participants,survey_id } = req.body;

    

        let savedParticipants = [];

        for (let participant of participants) {
            const { p_first_name, p_last_name, p_email } = participant;

            // Create a new SurveyParticipant
            const newParticipant = new SurveyParticipant({
                survey_id,
                p_first_name,
                p_last_name,
                p_email
            });

            const savedParticipant = await newParticipant.save();
            savedParticipants.push(savedParticipant);
        }

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
            .populate('mgr_id', 'first_name last_name email')
            .populate('loop_lead_id', 'first_name last_name email')
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
        const { loop_lead_id, mgr_id, survey_id,org_id } = req.query;

        // Build the query object based on the provided parameters
        let query = {};
        if (loop_lead_id && org_id) query = { loop_lead_id: loop_lead_id, organization_id: org_id };
        if (mgr_id) query.mgr_id = mgr_id;
        if (survey_id) query._id = survey_id;

        // Find the survey(s) by the provided ID(s) and populate related fields
        const surveys = await Survey.find(query)
            .populate('loop_lead_id', 'name email') // Populate loop_lead_id with name and email fields
            .populate('mgr_id', 'first_name last_name email')
            .populate('loop_lead_id', 'first_name last_name email') // Populate mgr_id with name and email fields
            .populate('organization_id', 'name')
            .populate({
                path: 'competencies', // Path to populate
                populate: {
                    path: 'question_id', // Path to populate within competencies
                    select: 'questionText questionType',
                    populate: {
                        path: 'options', // Path to populate within competencies
                        select: 'text',
                    }
                }
            })
        if (!surveys || surveys.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        const results = await Promise.all(
            surveys.map(async (survey) => {
                const totalParticipants = await SurveyParticipant.countDocuments({ survey_id: survey._id });
                const completed_survey = await SurveyParticipant.countDocuments({ survey_id: survey._id, survey_status:'completed' });

                return {
                    ...survey.toObject(), // Convert the Mongoose document to a plain object
                    totalParticipants,
                    completed_survey
                };
            })
        );
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
        const { survey_id, searchTerm } = req.query;
        let query={survey_id:survey_id}
        if (searchTerm) {
            query.$or = [
                { p_first_name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by first_name
                { p_last_name: { $regex: searchTerm, $options: 'i' } },  // Case-insensitive search by last_name
                { p_email: { $regex: searchTerm, $options: 'i' } },      // Case-insensitive search by email
                { survey_status: { $regex: searchTerm, $options: 'i' } },      // Case-insensitive search by phone
            ];
        }
        // Find the survey participants by survey_id
        const participants = await SurveyParticipant.find(query)
            .populate('survey_id', 'name')
            .populate('p_mag_id', 'first_name last_name');// Populate survey_id with name field

        // if (!participants || participants.length === 0) {
        //     return res.status(404).json({ error: 'No participants found for this survey' });
        // }

        res.status(200).json({
            status: 'success',
            data: participants
        });
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