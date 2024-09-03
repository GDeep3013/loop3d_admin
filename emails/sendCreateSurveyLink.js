
const transporter = require('./transporter');

const sendSurveyCreationEmail = (email, surveyLink) => {
  const mailOptions = {
    from: 'sahil.610weblab@gmail.com',
    to: email,
    subject: 'Create Your Survey',
    text: `You've been invited to create a new survey. Click the link below to get started: ${surveyLink}`,
    html: `
      <p>Hello,</p>
      <p>You've been invited to create a new survey. Please click the link below to get started:</p>
      <p><a href="${surveyLink}">Create Survey</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you!</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendSurveyCreationEmail };
