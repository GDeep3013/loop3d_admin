// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sahil.610weblab@gmail.com',
    pass: 'qrpclksspftimwxx'
  }
});
module.exports = transporter;