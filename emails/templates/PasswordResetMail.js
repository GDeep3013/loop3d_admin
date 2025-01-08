

const emailHeaderFooter = require('./emailHeaderFooter');

const PasswordResetMail = (recipientDetails) => {
  const resetUrl = `${process.env.ADMIN_PANEL}/reset-password?token=${recipientDetails.token}`;
  let last_name = (recipientDetails.user.last_name != undefined && recipientDetails.user.last_name != null) ? recipientDetails.user.last_name : ''
  const bodyContent = `<tr>
    <td>
        <p>Hi ${recipientDetails?.user.first_name} ${last_name},</p>
        <p>You recently requested to reset your password for your LOOP3D account. Please click the button below to reset your password. If you did not request this change, please ignore this email or contact our support team if you have concerns.</p>
        <br />
        <a style="display: inline-block; text-decoration: none; padding: 12px 25px; color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${resetUrl}">RESET PASSWORD</a>
        <br />
        <p><strong>Note:</strong> For your security, this password reset link will expire in 24 hours. If you are unable to reset your password within this timeframe, please request a new one.</p>
        <p>Thanks!</p>
        <p>The LOOP3D Team</p>
    </td>
</tr>`
return {
  from: 'LOOP3D <aaron.loop360@gmail.com>',
  to: recipientDetails.user.email,
  subject: 'Password Reset',
  html: emailHeaderFooter(bodyContent),
};
};

module.exports = { PasswordResetMail };