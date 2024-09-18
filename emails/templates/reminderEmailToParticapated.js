
const emailHeaderFooter = require('./emailHeaderFooter');

const reminderEmailToParticapated = (recipientDetails) => {
    const bodyContent=` <tr>
                        <td>
                            <p>This is a friendly reminder to provide feedback for ${recipientDetails.LoopLeadName}. This
                                will only take 10 minutes to complete and we appreciate your valuable
                                input. You have ${recipientDetails.remaningDay} days remaining to provide your feedback.</p>
                                
                            <br />

                            <p> Please click on the following link to provide your responses:</p>
                            <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Link</a>

                            <br />
                            <p>Thanks!</p>

                            <p>The Loop3D Team</p>
                        </td>
                    </tr>`
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: recipientDetails.subject,       
        html: emailHeaderFooter(bodyContent)
    };
};

module.exports = { reminderEmailToParticapated };
