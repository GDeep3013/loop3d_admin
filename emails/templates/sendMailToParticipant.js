const sendMailToParticipant = (recipientDetails) => {
return {
    from: 'sahil.610weblab@gmail.com',
    to: recipientDetails.p_email,
    subject: 'Loop3D 360 Feedback Process - Launch ',
    text: `As a part of your organization’s leadership development programs, we have launched the Loop3D 360 Feedback Process and you have been selected as a rater. The purpose is to provide feedback for ${recipientDetails.name} who selected you as a rater. Your responses are anonymous and we encourage your honest and candid feedback. Our goal is to generate a report with the data collected to look at overarching themes and patterns. This should only take 10 minutes to complete. Please complete and submit the survey in its entirety, as your progress will not be saved to complete at a later time.

    In responding, please think about your experience in working with this individual and provide objective feedback. This is an opportunity to share candid and constructive feedback for each participant by giving them a “360° lens” from their coworkers on their leadership strengths and developmental areas. Please click on the following link to provide your responses: ${recipientDetails.url}

    Thanks!

    The Loop3D Team`,
    html: `

           <p>As a part of your organization’s leadership development programs, we have launched the Loop3D 360 Feedback Process and you have been selected as a rater. The purpose is to provide feedback for ${recipientDetails.name} who selected you as a rater. Your responses are anonymous and we encourage your honest and candid feedback. Our goal is to generate a report with the data collected to look at overarching themes and patterns. <strong>This should only take 10 minutes to complete. Please complete and submit the survey in its entirety, as your progress will not be saved to complete at a later time.</strong></p>
    
          <p> In responding, please think about your experience in working with this individual and provide objective feedback. This is an opportunity to share candid and constructive feedback for each participant by giving them a “360° lens” from their coworkers on their leadership strengths and developmental areas. Please click on the following link to provide your responses:</p><p><a href="${recipientDetails.url}">Link</a></p>            
          <p>Thanks!<br/>The Loop3D Team</p> `
  };
};

module.exports = { sendMailToParticipant };