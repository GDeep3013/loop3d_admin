const emailHeaderFooter = require('./emailHeaderFooter');

const sendCredentialMail = (recipientDetails) => {
  let last_name = (recipientDetails.last_name != undefined  && recipientDetails.last_name != null )? recipientDetails.last_name:''
    const bodyContent=`<tr>
                     <td>
                        <p>Hi ${recipientDetails.first_name}  ${last_name},</p>
                        <p>Welcome to Loop3D! Your account has been created, and you can now access your Loop3D 360 Dashboard. Below are your login credentials:</p>
                        <br />
                        
                        <p><strong>Email:</strong> ${recipientDetails.email}</p>                       
                        <p><strong>Password:</strong> ${recipientDetails.password}</p>

                        <p>To continue, please reset your password and access your Loop3D dashboard by clicking the link below:</p>
                        <br />
                        <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.admin_panel_url}">RESET PASSWORD</a>
                        <br />
                        <p>Thanks!</p>
                        <p>The Loop3D Team</p>
                    </td>
                </tr>`
    return {
      from: 'Loop3D <aaron.loop360@gmail.com>', 
      to: recipientDetails.email,
      subject: 'Progress Check - Loop3D Development',
      html:emailHeaderFooter(bodyContent)             
                    
             
    };
  };
  
  module.exports = { sendCredentialMail };