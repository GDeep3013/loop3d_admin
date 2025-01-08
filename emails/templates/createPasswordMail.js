const emailHeaderFooter = require('./emailHeaderFooter');

const createPasswordMail = (recipientDetails) => {
  let last_name = (recipientDetails.last_name != undefined  && recipientDetails.last_name != null )? recipientDetails.last_name:''
    const bodyContent=`<tr>
                     <td>
                        <p>Hi ${recipientDetails.first_name}  ${last_name},</p>
                        <p>Welcome to LOOP3D! Your account has been created, and you can now access your LOOP3D 360 Dashboard.</p>
                        <p>To continue, please reset your password and access your LOOP3D dashboard by clicking the link below:</p>
                        <br />
                        <a style="display: inline-block; text-decoration:none;padding: 12px 25px;color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${recipientDetails.admin_panel_url}">SET PASSWORD</a>
                        <br />
                        <p>Thanks!</p>
                        <p>The LOOP3D Team</p>
                    </td>
                </tr>`
    return {
      from: 'LOOP3D <aaron.loop360@gmail.com>', 
      to: recipientDetails.email,
      subject: 'Welcome to LOOP3D 360! Create Your Password',
      html:emailHeaderFooter(bodyContent)             
                    
             
    };
  };
  
  module.exports = { createPasswordMail };