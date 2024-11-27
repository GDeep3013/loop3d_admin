
const emailHeaderFooter = require('./emailHeaderFooter');

const sendLoopLeadLink = (recipientDetails) => {
    const bodyContent=`
                      <tr>
                        <td>
                            <p>Hi <strong>${recipientDetails.name}</strong>,</p>

                            <p> You've been nominated by your organization to participate in the Loop3D 360 Feedback Program. Congratulations! This means your organization is supportive of your development. This is an opportunity for you to gain a deeper understanding of your leadership style and impact by gathering feedback directly from the people (raters) you work with every day.</p>
                
                            <p>The feedback report will provide insight into:</p>
                            <ul>
                                <li>Your leadership style</li>
                                <li>Gaps and similarities of competency assessments between yourself and other co-workers</li>
                                <li>Customized coaching with strategies for professional development</li>
                            </ul>
                    
                            <p>You will be provided the opportunity to receive feedback from your co-workers by nominating them via the link below. Choose individuals who will provide honest and candid feedback about your knowledge, skills, and abilities.</p>
                             <p>You will need a minimum of 10 nominees, but keep in mind that your feedback data becomes more robust as you increase the number of nominees.</p>

                            <p>Get started by clicking on the following link:</p>
                            <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Add Participant</a>

                            <p> Simply respond to this email if you have any questions at all about the process.</p>

                            <p>Thanks!</p>
                            <p>The Loop3D Team</p>
                        </td>
                    </tr>
                `
  return {
    from: 'aaron.loop360@gmail.com',
    to: recipientDetails.email,
    subject: 'Loop3D 360 Feedback Process - Launch',
    html: emailHeaderFooter(bodyContent)
  };
};

module.exports = { sendLoopLeadLink };
