

const sendLoopLeadLink = (recipientDetails) => {
  return {
    from: 'sahil.610weblab@gmail.com',
    to: recipientDetails.email,
    subject: 'Loop3D 360 Feedback Process - Launch',
    html: `
     <html lang="en">
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
                            <p>Hi <strong>${recipientDetails.name}</strong>,</p>

                            <p> You've been nominated by your organization to participate in the Loop3D 360 Feedback Program. Congratulations! This means your organization is supportive of your development. This is an opportunity for you to gain a deeper understanding of your leadership style and impact by gathering feedback directly from the people (raters) you work with every day.</p>
                
                            <p>The feedback report will provide insight into:</p>
                            <ul>
                                <li>Your leadership style</li>
                                <li>Gaps and similarities of competency assessments between yourself and other co-workers</li>
                                <li>Customized coaching with strategies for professional development</li>
                            </ul>
                    
                            <p>You will be provided the opportunity to receive feedback from your co-workers by nominating them via the link below. Choose individuals who will provide honest and candid feedback about your knowledge, skills, and abilities. You will need a minimum of 10 nominees, but keep in mind that your feedback data becomes more robust as you increase the number of nominees.</p>

                            <p>Get started by clicking on the following link:</p>
                            <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.url}">Link</a>

                            <p> Simply respond to this email if you have any questions at all about the process.</p>

                            <p>Thanks!</p>
                            <p>The Loop3D Team</p>
                        </td>
                    </tr>
                </table>
            </div>
        </body>

</html>
        `
  };
};

module.exports = { sendLoopLeadLink };
