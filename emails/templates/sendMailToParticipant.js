const sendMailToParticipant = (recipientDetails) => {
return {
    from: 'sahil.610weblab@gmail.com',
    to: recipientDetails.p_email,
    subject: 'Loop3D 360 Feedback Process - Launch ',
    html: `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style type="text/css" media="screen">
            body { font-family: 'Roboto', sans-serif; }
            img { max-width: 100%; }
        </style>
    </head>
        <body style="padding:0 !important; margin:0 !important; display:block !important; min-width:100% !important; width:100% !important; background:#ffffff; -webkit-text-size-adjust:none;">
          <div class="wrapper" style="max-width: 850px; display: block; margin: auto; border: 1px solid #ddd;">

              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="padding: 20px 50px;">
                  <tr>
                      <td style="text-align: center; text-decoration: underline;">
                          <img src="https://610weblab.in/design-link/loop3d-logo.png" alt="Loop3D Logo" height="30px" border="0" />
                      </td>
                  </tr>
                  <br />
                  <tr>
                      <td>
                          <p>As a part of your organization’s leadership development programs, we have launched the Loop3D 360 Feedback Process and you have been selected as a rater. The purpose is to provide feedback for ${recipientDetails.name} who selected you as a rater. Your responses are anonymous and we encourage your honest and candid feedback. Our goal is to generate a report with the data collected to look at overarching themes and patterns. <strong>This should only take 10 minutes to complete. Please complete and submit the survey in its entirety, as your progress will not be saved to complete at a later time.</strong></p>

                          <p> In responding, please think about your experience in working with this individual and provide objective feedback. This is an opportunity to share candid and constructive feedback for each participant by giving them a “360° lens” from their coworkers on their leadership strengths and developmental areas. Please click on the following link to provide your responses:</p>
                        
                          <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Link</a>

                          <br />
                          <p>Thanks!</p>

                          <p>The Loop3D Team</p>
                      </td>
                  </tr>
              </table>
          </div>
      </body> 
    </html> `
  };
};

module.exports = { sendMailToParticipant };