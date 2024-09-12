

const completionEmailtoManger = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Loop3D 360 Process - [Loop3D Lead full name] - Complete',
        html: `<html lang="en">
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
                                <img src="https://610weblab.in/design-link/loop3d-logo.png" alt="Loop3D Logo" height="30px" border="0" />
                            </td>
                        </tr>
                        <br />
                        <tr>
                            <td>
                                <p>Thank you for your support in the development of [Loop3D Lead]. The
                        feedback collection process is complete for [Loop3D Lead] and a copy of their
                        Loop3D 360 Feedback Report has been emailed to them. We encourage you
                        to schedule follow up meetings to discuss key themes and findings in the
                        report, while also continuing with their ongoing development. We also
                        recommend conducting another Loop3D 360 Feedback process 2-3 months
                        from now to measure behavioral change and development of your leaders.</p>                 
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
        </html>
          `
    };
};

module.exports = { completionEmailtoManger };
