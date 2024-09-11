const transporter = require('./transporter');
const { sendLoopLeadLink } = require('./templates/sendLoopLeadLink');
const { sendSurveyCreationEmail } = require('./templates/sendSurveyCreationEmail');
const { sendMailToParticipant } = require('./templates/sendMailToParticipant');
const { completionEmailtoManger } = require('./templates/completionEmailtoManger');
const { completionEmailToLead } = require('./templates/completionEmailToLead');
const { thirdDayUpDateEmailToLead } = require('./templates/thirdDayUpDateEmailToLead');
const { sixDayUpDateEmailToLead } = require('./templates/sixDayUpDateEmailToLead');
const { twoThreeMonthEmailToLead } = require('./templates/twoThreeMonthEmailToLead');
const { reminderEmailToParticapated } = require('./templates/reminderEmailToParticapated');




const sendEmail = (type, recipientDetails) => {
    let mailOptions = {};
    switch (type) {
        case 'sendLoopLeadLink':
            mailOptions = sendLoopLeadLink(recipientDetails);
            break;
        case 'sendSurveyCreationEmail':
            mailOptions = sendSurveyCreationEmail(recipientDetails);
            break;
        case 'sendMailToParticipant':
            mailOptions = sendMailToParticipant(recipientDetails);
            break;
        case 'completionEmailtoManger':
            mailOptions = completionEmailtoManger(recipientDetails);
            break;
        case 'completionEmailToLead':
            mailOptions = completionEmailToLead(recipientDetails);
            break;
        case 'thirdDayUpDateEmailToLead':
            mailOptions = thirdDayUpDateEmailToLead(recipientDetails);
            break;
        case 'sixDayUpDateEmailToLead':
            mailOptions = sixDayUpDateEmailToLead(recipientDetails);
            break;
        case 'twoThreeMonthEmailToLead':
            mailOptions = twoThreeMonthEmailToLead(recipientDetails);
            break;
        case 'reminderEmailToParticapated':
            mailOptions = reminderEmailToParticapated(recipientDetails);
            break;

        default:
            throw new Error('Invalid email type');
    }
    return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
