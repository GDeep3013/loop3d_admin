const cron = require('node-cron');
require('dotenv').config();
const SurveyParticipant = require('./app/models/SurveyParticipantModel'); // Adjust the path as needed
const mongoose = require('mongoose');
const moment = require('moment'); // Use moment.js to handle date calculations
const Survey = require('./app/models/Survey')

const User = require('./app/models/User')
const { sendEmail } = require('./emails/sendEmail');
// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
    console.log('MongoDB connection established');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1); // Exit process with failure
  }
}

connectDB();

// Function to fetch all participants with 'pending' survey_status
const fetchPendingParticipants = async () => {
  try {
    const participants = await SurveyParticipant.find({ survey_status: 'pending' })
      .populate('survey_id', 'name').populate({
        path: 'survey_id',
        select: 'name',
        populate: {
          path: 'loop_lead',
          select: 'first_name last_name'
        }
      })
      .populate('p_mag_id', 'first_name last_name');
    return participants;
  } catch (error) {
    console.error('Failed to fetch pending participants:', error);
    return [];
  }
};

const calculateDaysSinceCreated = (createdDate) => {
  const now = moment();
  const createdAt = moment(createdDate);
  return now.diff(createdAt, 'days');
};

const processPendingParticipants = async () => {
  const pendingParticipants = await fetchPendingParticipants();

  if (pendingParticipants.length === 0) {
    console.log('No pending participants found.');
    return;
  }

  for (const participant of pendingParticipants) {
    const email = participant.p_email;
    // console.log(participant?._id,participant?.survey_id,'email');
    const LoopLeadName = (participant?.survey_id?.loop_lead?.first_name) ? participant?.survey_id?.loop_lead?.first_name : 'Loop3D Lead';
    const surveyID = participant?.survey_id?._id;
    // console.log( participant,surveyID,'surveyID');
    const url = `${process.env.FRONT_END_URL}/feedback-survey?survey_id=${surveyID}&participant_id=${participant._id}`
    const daysSinceCreated = calculateDaysSinceCreated(participant.createdAt);  

    if (daysSinceCreated === 2) {
      // Send second reminder
      let subject = 'Friendly Reminder: Loop3D Lead Feedback Required'
      let remaningDay = '4'
      await sendEmail('reminderEmailToParticapated', { email, url, subject, remaningDay, LoopLeadName });

    } else if (daysSinceCreated === 3) {
      // Send third reminder
      let subject = 'Action Required: Loop3D Lead Feedback Due'
      let remaningDay = '3'
      await sendEmail('reminderEmailToParticapated', { email, url, subject, remaningDay, LoopLeadName });

    }
    else if (daysSinceCreated === 4) {
      // Send fouth reminder
      let subject = 'Please Hurry: Loop3D Lead Feedback Due'
      let remaningDay = '2'
      await sendEmail('reminderEmailToParticapated', { email, url, subject, remaningDay, LoopLeadName });

    }
    else if (daysSinceCreated === 5) {
      // Send firth reminder
      let subject = 'Action Required: Loop3D Lead Feedback Due'
      let remaningDay = '2'
      await sendEmail('reminderEmailToParticapated', { email, url, subject, remaningDay, LoopLeadName });

    }
    else if (daysSinceCreated === 6) {
      // Send six reminder
      let subject = 'Action Required: Loop3D Lead Feedback Due'
      let remaningDay = '2'
      await sendEmail('reminderEmailToParticapated', { email, url, subject, remaningDay, LoopLeadName });

    }
    else if (daysSinceCreated === 7) {
      // Send seventh  reminder
      let subject = 'URGENT: Loop3D Lead Feedback Due'
      let remaningDay = '2'
      await sendEmail('reminderEmailToParticapated', { email, url, subject, remaningDay, LoopLeadName });

    }

  }
};

const fetchPendingSurveys = async () => {
  try {
    // Fetch surveys with 'pending' status and populate loop_lead and manager details
    const surveys = await Survey.find({ survey_status: 'pending' }).populate('loop_lead', 'first_name last_name email')
    return surveys;
  } catch (error) {
    console.error('Failed to fetch pending surveys:', error);
    return [];
  }

}

const processPendingSurveys = async () => {
  const pendingSurveys = await fetchPendingSurveys();

  if (pendingSurveys.length === 0) {
    return;
  }

  for (const survey of pendingSurveys) {

    const LeadName = (survey?.loop_lead?.first_name) ? survey?.loop_lead?.first_name : 'Loop3D Lead'
    const email = survey?.loop_lead?.email
    const daysSinceCreated = calculateDaysSinceCreated(survey.createdAt);
    const url = `${process.env.ADMIN_PANEL}`

    if (email && daysSinceCreated === 3) {
      await sendEmail('thirdDayUpDateEmailToLead', { email, url, LeadName });    
      } else if (email && daysSinceCreated === 6) {
      await sendEmail('sixDayUpDateEmailToLead', { email, url, LeadName });
    } else if (email &&daysSinceCreated === 60) {
      await sendEmail('twoThreeMonthEmailToLead', { email, url, LeadName });
    } else if (email && daysSinceCreated === 90) {
      await sendEmail('twoThreeMonthEmailToLead', { email, url, LeadName });
    }
  }
}


// Cron job to run every minute


const task = cron.schedule('0 0 * * *', () => {
    processPendingParticipants()
    processPendingSurveys()
    .then(() => {
      console.log('All pending participants processed.');
      // task.stop(); // Uncomment to stop the cron job after running once
    })
    .catch(error => {
      console.error('Error while processing participants:', error);
    });
});

