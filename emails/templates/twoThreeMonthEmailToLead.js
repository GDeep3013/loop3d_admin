const twoThreeMonthEmailToLead = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Progress Check - Loop3D Development',
        text: `Hi [Loop3D Lead first name],

            It's been 2 months since you completed your Loop3D 360 Feedback Process and we just
            wanted to check in on your progress. Keep in mind that professional development takes time
            and it's a journey. Now would be a good time to measure your progress by launching another
            Loop3D 360 Feedback Process and gain insightful feedback critical to your leadership
            development. Click on the link below to access your Loop3D 360 Dashboard.

            [LINK TO DASHBOARD]

            Thanks!

            The Loop3D Team`,
        html: `
            <p>Hi [Loop3D Lead first name]</p>,

          <p>It's been 2 months since you completed your Loop3D 360 Feedback Process and we just
            wanted to check in on your progress. Keep in mind that professional development takes time
            and it's a journey. Now would be a good time to measure your progress by launching another
            Loop3D 360 Feedback Process and gain insightful feedback critical to your leadership
            development. Click on the link below to access your Loop3D 360 Dashboard.</p>

           <p> [LINK TO DASHBOARD]</p>

             <p> Thanks! </p> 

            The Loop3D Team `
      };
    };
    
    module.exports = { twoThreeMonthEmailToLead };