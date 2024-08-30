const Survey = require('../models/Survey');
const SurveyMember = require('../models/SurveyMemberModel');

// Create Survey and Add Survey Members
exports.createSurveyWithMembers = async (req, res) => {
    try {
        const { surveyData, membersData } = req.body;

        // Create the Survey
        const survey = new Survey(surveyData);
        const savedSurvey = await survey.save();

        // Create the Survey Members and link to the created survey
        const surveyMembers = membersData.map(member => ({
            ...member,
            survey_id: savedSurvey._id
        }));

        await SurveyMember.insertMany(surveyMembers);

        res.status(201).json({
            status: 'success',
            data: {
                survey: savedSurvey,
                surveyMembers
            }
        });
    } catch (error) {
        console.error('Error creating survey and survey members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};