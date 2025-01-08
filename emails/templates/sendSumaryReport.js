const emailHeaderFooter = require('./emailHeaderFooter');

const sendSumaryReport = (recipientDetails) => {
    const bodyContent= `<tr>
    <td>
        <p>Thank you for participating in the LOOP3D 360 Feedback Process. As part of our leadership development program, we have gathered the feedback from your selected raters to provide valuable insights. You can now view the summary report for <strong>${recipientDetails.name}</strong>.</p>

        <p>Please click the link below to view your summary report:</p>
      
        <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.summary_url}">View Report</a>

        <br />
        <p>Thanks!</p>

        <p>The LOOP3D Team</p>
    </td>
</tr>
`
return {
    from: 'LOOP3D <aaron.loop360@gmail.com>', 
    to: recipientDetails.email,
    subject: 'LOOP3D 360 Feedback Process - Launch ',
    html:emailHeaderFooter(bodyContent)
  };
};

module.exports = { sendSumaryReport };