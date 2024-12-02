const emailHeaderFooter = require('./emailHeaderFooter');

const sixDayUpDateEmailToLead = (recipientDetails) => {
    const bodyContent=` <tr>
                     <td>
                        <p>Hi ${recipientDetails.LeadName},</p>

                         <p>We do not have the required number of respondents to generate your report. Please send a 
                            follow up email to your raters urging them to take a few minutes to provide their feedback. Click 
                            on the link below to access your raters from your Loop3D 360 Dashboard</p>
                           
                          <a  style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;"  href="${recipientDetails.url}">Go to website</a>
                            <br />
                            <p>Thanks!</p>
                            <p>The Loop3D Team</p>
                        </td>
                    </tr> `
    return {
        from: 'Loop3D <aaron.loop360@gmail.com>', 
        to: recipientDetails.email,
        subject: 'Action Required: Insufficient Response Rate',
        html: emailHeaderFooter(bodyContent)
    };
};

module.exports = { sixDayUpDateEmailToLead };
