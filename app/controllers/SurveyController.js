const Survey = require('../models/Survey');
const SurveyParticipant = require('../models/SurveyParticipantModel');

// Create Survey and Add Survey Members
exports.createSurveyWithMembers = async (req, res) => {
    try {
        const { surveyData, membersData } = req.body;

        // Create the Survey
        const survey = new Survey(surveyData);
        const savedSurvey = await survey.save();

        // Filter out members with duplicate emails for the same survey
        const uniqueMembers = [];
        for (let member of membersData) {
            const existingParticipant = await SurveyParticipant.findOne({
                survey_id: savedSurvey._id,
                email: member.email,
            });

            if (!existingParticipant) {
                uniqueMembers.push({
                    ...member,
                    survey_id: savedSurvey._id
                });
            }
        }

        // Insert only unique survey members
        if (uniqueMembers.length > 0) {
            let survey_participants = await SurveyParticipant.insertMany(uniqueMembers);

            const totalInviteesCount = survey_participants.length;
            await Survey.findByIdAndUpdate(savedSurvey._id, {
                total_invites: totalInviteesCount
            }, { new: true });

            
        }

        res.status(201).json({
            status: 'success',
            data: {
                survey: savedSurvey,
                surveyMembers: uniqueMembers
            }
        });
    } catch (error) {
        console.error('Error creating survey and survey members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllSurvey = async (req, res) => {
    try {

        let {searchTerm } = req.query;
        const query = {};

        if (searchTerm) {
            query.$or = [
                { survey_status: { $regex: searchTerm, $options: 'i' } },
                { ll_survey_status: { $regex: searchTerm, $options: 'i' } },
                { mgr_survey_status: { $regex: searchTerm, $options: 'i' } }


            ];
        }

        // Find the survey(s) by the provided ID(s) and populate related fields
        const surveys = await Survey.find(query)
            .populate('mgr_id', 'first_name last_name email')
            .populate('loop_lead_id', 'first_name last_name email') // Populate mgr_id with name and email fields
            // Populate mgr_id with name and email fields
            .populate('organization_id', 'name') // Populate organization_id with name field
        // if (!surveys || surveys.length === 0) {
        //     return res.status(404).json({ error: 'Survey not found' });
        // }
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
            .populate('organization_id', 'name') // Populate organization_id with name field
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