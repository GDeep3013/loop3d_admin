const reminderEmailToParticapated = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: '[Friendly Reminder: Loop3D Lead Feedback Required]',
        text: `

        This is a friendly reminder to provide feedback for [Loop3D Lead]. This
        will only take 10 minutes to complete and we appreciate your valuable
        input. You have 4 days remaining to provide your feedback.
        
        Please click on the following link to provide your responses: [LINK]

        Thanks!

        The Loop3D Team`,
        html: `
            <p>This is a friendly reminder to provide feedback for [Loop3D Lead]. This
            will only take 10 minutes to complete and we appreciate your valuable
            input. You have 4 days remaining to provide your feedback.</p>

            <p>Please click on the following link to provide your responses:</p><a href='#'>[LINK]</a>

            <p>Thanks!</p>

            <p>The Loop3D Team</p>
          `
    };
};

module.exports = { reminderEmailToParticapated };
