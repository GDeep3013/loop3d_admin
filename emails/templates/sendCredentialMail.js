const emailHeaderFooter = require('./emailHeaderFooter');

const sendCredentialMail = (recipientDetails) => {
    const bodyContent=`<tr>
                     <td>
                        <p>Hi ${recipientDetails.first_name}  ${recipientDetails.last_name},</p>
                        <p>Welcome to Loop3D! Your account has been created, and you can now access your Loop3D 360 Dashboard. Below are your login credentials:</p>
                        <br />
                        
                        <p><strong>Email:</strong> ${recipientDetails.email}</p>                       
                        <p><strong>Password:</strong> ${recipientDetails.password}</p>

                        <p>It's been 2 months since you completed your Loop3D 360 Feedback Process, and we just wanted to check in on your progress. Remember, professional development is a journey, and now would be a good time to measure your progress by launching another Loop3D 360 Feedback Process. Gain insightful feedback critical to your leadership development by clicking the link below to access your dashboard:</p>
                        <br />
                        <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.admin_panel_url}">LINK TO DASHBOARD</a>
                        <br />
                        <p>Thanks!</p>
                        <p>The Loop3D Team</p>
                    </td>
                </tr>`
    return {
      from: 'sahil.610weblab@gmail.com',
      to: recipientDetails.email,
      subject: 'Progress Check - Loop3D Development',
      html:emailHeaderFooter(bodyContent)             
                    
             
    };
  };
  
  module.exports = { sendCredentialMail };