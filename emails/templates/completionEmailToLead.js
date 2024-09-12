

const completionEmailToLead = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Loop3D 360 Feedback Process - [Loop3D Lead full name] - Complete',
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
                    </tr>
                </table>
            </div>
        </body>
        </html>`
    };
};

module.exports = { completionEmailToLead };
