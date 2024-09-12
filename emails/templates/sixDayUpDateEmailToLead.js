

const sixDayUpDateEmailToLead = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Action Required: Insufficient Response Rate',
        html: `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        
            <style type="text/css" media="screen">
                body {
                    font-family: 'Roboto', sans-serif;
                }
                img {
                    max-width: 100%;
                }
            </style>
        </head>
        
        <body style="padding:0 !important; margin:0 !important; display:block !important; min-width:100% !important; width:100% !important; background:#ffffff; -webkit-text-size-adjust:none;">
            <div class="wrapper" style="max-width: 850px; display: block; margin: auto; border: 1px solid #ddd;">
        
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="padding: 20px 50px;">
                    <tr>
                        <td style="text-align: center; text-decoration: underline;">
                            <img src="https://610weblab.in/design-link/loop3d-logo.png" alt="Loop3D Logo"  height="30px" border="0" />
                        </td>
                    </tr>
                    <br />
                    <tr>
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
                    </tr>
                </table>
            </div>
        </body>
        </html>
                
          `
    };
};

module.exports = { sixDayUpDateEmailToLead };
