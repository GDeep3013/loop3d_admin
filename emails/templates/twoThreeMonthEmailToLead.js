const emailHeaderFooter = require('./emailHeaderFooter');

const twoThreeMonthEmailToLead = (recipientDetails) => {
    const bodyContent = ` 
                <tr>
                      <td>
                          <p>Hi ${recipientDetails.LeadName},</p>
                          <br />
                          <p> It's been 2 months since you completed your Loop3D 360 Feedback Process and we just
                              wanted to check in on your progress. Keep in mind that professional development takes time
                              and it's a journey. Now would be a good time to measure your progress by launching another
                              Loop3D 360 Feedback Process and gain insightful feedback critical to your leadership
                              development. Click on the link below to access your Loop3D 360 Dashboard.</p>
                          <br />
                          <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">LINK TO DASHBOARD</a>
                          <br />
                          <p>Thanks!</p>
                          <p>The Loop3D Team</p>
                      </td>
                  </tr>`
    return {
        from: 'Loop3D <aaron.loop360@gmail.com>', 
        to: recipientDetails.email,
        subject: 'Progress Check - Loop3D Development',
        html: emailHeaderFooter(bodyContent)
    };
};

module.exports = { twoThreeMonthEmailToLead };