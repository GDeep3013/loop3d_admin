// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sahil.610weblab@gmail.com',
    pass: 'qrpclksspftimwxx'
  }
});

const sendResetEmail = (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

  const mailOptions = {
    from: 'sahil.610weblab@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset. Click the link to reset your password:</p><a href="${resetUrl}">Reset Password</a>`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
