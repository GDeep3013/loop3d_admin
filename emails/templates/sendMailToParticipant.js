const emailHeaderFooter = require('./emailHeaderFooter');

const sendMailToParticipant = (recipientDetails) => {
    const bodyContent= `<tr>
    <td>
        <p>As a part of your organization’s leadership development programs, we have launched the LOOP3D 360 Feedback Process and you have been selected as a rater. The purpose is to provide feedback for ${recipientDetails.name} who selected you as a rater. Your responses are anonymous and we encourage your honest and candid feedback. Our goal is to generate a report with the data collected to look at overarching themes and patterns. <strong>This should only take 10 minutes to complete. Please complete and submit the survey in its entirety, as your progress will not be saved to complete at a later time.</strong></p>

        <p> In responding, please think about your experience in working with this individual and provide objective feedback. This is an opportunity to share candid and constructive feedback for each participant by giving them a “360° lens” from their coworkers on their leadership strengths and developmental areas. Please click on the following link to provide your responses:</p>
      
        <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Take the survey</a>

        <br />
        <p>Thanks!</p>

        <p>The LOOP3D Team</p>
    </td>
</tr>`
return {
    from: 'LOOP3D <aaron.loop360@gmail.com>', 
    to: recipientDetails.p_email,
    subject: 'LOOP3D 360 Feedback Process - Launch ',
    html:emailHeaderFooter(bodyContent)
  };
};

module.exports = { sendMailToParticipant };