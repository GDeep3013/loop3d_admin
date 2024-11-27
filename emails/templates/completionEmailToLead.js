const emailHeaderFooter = require("./emailHeaderFooter");

const completionEmailToLead = (recipientDetails) => {
    const bodyContent=`<tr>
                        <td>
                            <p>Greetings <strong>[Loop3D Lead full name]</strong>,</p>
                            <br />
                            <p>Congratulations on the completion of your <strong>Loop3D 360 Feedback Report</strong>! You can now access your report by clicking the link below to view your dashboard.</p>
                        
                            <p>Our recommendations:</p>

                            <ol>
                            <li>Review your report and highlight your top strengths and developmental areas</li>
                            <li>Schedule a meeting with your supervisor to review key themes</li>
                            <li>Build a development plan based on our proprietary tools tailored toward YOUR development</li>
                            <li>Conduct another Loop3D 360 Feedback Process in 2-3 months to continuously measure your progress</li>
                            </ol>
                            <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Access Your Dashboard</a>

                            <br />
                            <p>Thanks!</p>
                            <p>The Loop3D Team</p>
                        </td>                    
                        </tr>`
    return {
        from: 'aaron.loop360@gmail.com',
        to: recipientDetails.email,
        subject: 'Loop3D 360 Feedback Process - [Loop3D Lead full name] - Complete',
        html: emailHeaderFooter(bodyContent)
    };
};

module.exports = { completionEmailToLead };
