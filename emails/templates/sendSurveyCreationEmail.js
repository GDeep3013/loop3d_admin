const emailHeaderFooter = require('./emailHeaderFooter');
const sendSurveyCreationEmail = (recipientDetails) => {
    const bodyContent=` <tr>
                      <td>
                          <p>Welcome to Loop3D! Our system is engineered to perpetually drive selfawareness and growth for leaders within your organization using a proprietery combination of artificial intelligence, doctoral level intervention and review, and personal customized AI development coaches. </p>
                          
                          <p> In order to get the 360 feedback process started for <strong>${recipientDetails.roles}</strong>, we need you to click the following link and select the top 3 most relevant competencies for <strong>${recipientDetails.roles}</strong>'s role.</p>

                          <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Create Survey</a>
                          <br />
                          
                          <p>If you have any questions at all feel free to reach out to us.</p>
                          <p>Thanks!</p>
                      </td>
                  </tr>`
  return  {
    from: 'aaron.loop360@gmail.com',
    to: recipientDetails.email,
    subject: 'Loop3D 360 Feedback Process - Launch',    
    html: emailHeaderFooter(bodyContent)
  };

};

module.exports = { sendSurveyCreationEmail };
