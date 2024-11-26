// emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config()
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendResetEmail = (email, token) => {
  const resetUrl = `${process.env.ADMIN_PANEL}/reset-password?token=${token}`;

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
