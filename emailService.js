// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'yogeshrana.610weblab@gmail.com',
    pass: 'qtjeckjckuouhckk'
  }
});

const sendResetEmail = (email, token) => {
  const resetUrl = `https://marketer-ai.webziainfotech.com/reset-password?token=${token}`;

  const mailOptions = {
    from: 'yogeshrana.610weblab@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset. Click the link to reset your password:</p><a href="${resetUrl}">Reset Password</a>`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
