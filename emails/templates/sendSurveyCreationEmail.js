const sendSurveyCreationEmail = (recipientDetails) => {
  return  {
    from: 'sahil.610weblab@gmail.com',
    to: recipientDetails.email,
    subject: 'Loop3D 360 Feedback Process - Launch',
    text: `Welcome to Loop3D! Our system is engineered to perpetually drive self- awareness and growth for leaders within your organization using a proprietery combination of artificial intelligence, doctoral level intervention and review, and personal customized AI development coaches.

   In order to get the 360 feedback process started for ${recipientDetails.roles}, we need you to click the following link and select the top 3 most relevant competencies for ${recipientDetails.roles}'s role.

   ${recipientDetails.url}

   If you have any questions at all feel free to reach out to us.

    Thanks!`
    ,
    html: ` <p>Welcome to Loop3D! Our system is engineered to perpetually drive self- awareness and growth for leaders within your organization using a proprietery combination of artificial intelligence, doctoral level intervention and review, and personal customized AI development coaches.</p>
     <p>In order to get the 360 feedback process started for <strong>${recipientDetails.roles}</strong>, we need you to click the following link and select the top 3 most relevant competencies for <strong>${recipientDetails.roles}</strong>'s role.</p>
    <p><a href="${recipientDetails.url}"><strong>Link</strong></p>
    <p>If you have any questions at all feel free to reach out to us.</p>
    <p>Thanks!</p>
    `
  };

};

module.exports = { sendSurveyCreationEmail };
