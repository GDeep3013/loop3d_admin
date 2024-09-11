

const thirdDayUpDateEmailToLead = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Loop3D 360 Feedback Process - Status Update',
        text: `
        Hi [Loop3D Lead first name],

        We're following up with a status update on the data collection process from your raters. We
        currently do not have a sufficient response rate to generate your report. We suggest sending a
        follow up email to your raters to first thank those who have responded, while including a friendly
        reminder to those who have not submitted their insightful feedback. We need to ensure we
        gather the required response rate to be able to generate your report. Click on the link below to
        access your raters from your Loop3D 360 Dashboard.

        [LINK TO DASHBOARD]

        Thanks!

        The Loop3D Team`,

        html: `
         <p>Hi [Loop3D Lead first name],</p>

        We're following up with a status update on the data collection process from your raters. We
        currently do not have a sufficient response rate to generate your report. We suggest sending a
        follow up email to your raters to first thank those who have responded, while including a friendly
        reminder to those who have not submitted their insightful feedback. We need to ensure we
        gather the required response rate to be able to generate your report. Click on the link below to
        access your raters from your Loop3D 360 Dashboard.</p></p>

        <a> [LINK TO DASHBOARD] </a>

       <p>Thanks!</p>

        <p>The Loop3D Team</p>
          `
    };
};

module.exports = { thirdDayUpDateEmailToLead };
