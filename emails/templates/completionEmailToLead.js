

const completionEmailToLead = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Loop3D 360 Feedback Process - [Loop3D Lead full name] - Complete',
        text: `
        Greetings [Loop3D Lead full name]
        ,
        Congratulations on the completion of your Loop3D 360 Feedback Report! You can now access
        the report by clicking on the link below to access your dashboard.

        Our recommendations:
        1. Review your report and highlight your top strengths and developmental areas
        2. Schedule a meeting with your supervisor to review key themes
        3. Build a development plan based on our proprietary tools tailored toward YOUR development
        4. Conduct another Loop3D 360 Feedback Process in 2-3 months to continuously measure your
        progress.

        [LINK TO DASHBOARD]

        Thanks!

        The Loop3D Team
        `,

        html: `

            <p>Greetings <strong>[Loop3D Lead full name]</strong>,</p>

            <p>Congratulations on the completion of your <strong>Loop3D 360 Feedback Report</strong>! You can now access your report by clicking the link below to view your dashboard.</p>

            <p>Our recommendations:</p>
            <ol>
            <li>Review your report and highlight your top strengths and developmental areas</li>
            <li>Schedule a meeting with your supervisor to review key themes</li>
            <li>Build a development plan based on our proprietary tools tailored toward YOUR development</li>
            <li>Conduct another Loop3D 360 Feedback Process in 2-3 months to continuously measure your progress</li>
            </ol>

            <p><a href="[LINK TO DASHBOARD]">Access Your Dashboard</a></p>

            <p>Thanks!<br />The Loop3D Team</p>
          `
    };
};

module.exports = { completionEmailToLead };
