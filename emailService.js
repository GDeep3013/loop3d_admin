// emailService.js
const nodemailer = require('nodemailer');
const emailHeaderFooter = require('./emails/templates/emailHeaderFooter.js');
require('dotenv').config()
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendResetEmail = (user, token) => {
  const resetUrl = `${process.env.ADMIN_PANEL}/reset-password?token=${token}`;
  let last_name = (user.last_name != undefined && user.last_name != null) ? user.last_name : ''
  const bodyContent = `<tr>
    <td>
        <p>Hi ${user.first_name} ${last_name},</p>
        <p>You recently requested to reset your password for your Loop3D account. Please click the button below to reset your password. If you did not request this change, please ignore this email or contact our support team if you have concerns.</p>
        <br />
        <a style="display: inline-block; text-decoration: none; padding: 12px 25px; color: #fff; background-color: #7abcdb; border-radius: 5px;" href="${resetUrl}">RESET PASSWORD</a>
        <br />
        <p><strong>Note:</strong> For your security, this password reset link will expire in 24 hours. If you are unable to reset your password within this timeframe, please request a new one.</p>
        <p>Thanks!</p>
        <p>The Loop3D Team</p>
    </td>
</tr>
`

  const mailOptions = {
    from: 'aaron.loop360@gmail.com',
    to: user?.email,
    subject: 'Password Reset',
    html: emailHeaderFooter(bodyContent)
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
