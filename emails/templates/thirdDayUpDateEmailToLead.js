
const emailHeaderFooter = require('./emailHeaderFooter');

const thirdDayUpDateEmailToLead = (recipientDetails) => {
    const bodyContent = ` <tr>
                <td>
                    <p>Hi ${recipientDetails.LeadName},</p>
                    <p> We're following up with a status update on the data collection process from your raters. We 
                    currently do not have a sufficient response rate to generate your report. We suggest sending a 
                    follow up email to your raters to first thank those who have responded, while including a friendly 
                    reminder to those who have not submitted their insightful feedback. We need to ensure we 
                    gather the required response rate to be able to generate your report. Click on the link below to 
                    access your raters from your Loop3D 360 Dashboard.
                    </p>
                    <br />
                    <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Go to website</a>
                    <br />
                    <p>Thanks!</p>
                    <p>The Loop3D Team</p>
                </td>
        </tr>`;
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Loop3D 360 Feedback Process - Status Update',
        html:emailHeaderFooter(bodyContent)
    };
};

module.exports = { thirdDayUpDateEmailToLead };
