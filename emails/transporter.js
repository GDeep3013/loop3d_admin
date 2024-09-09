// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'yogeshrana.610weblab@gmail.com',
    pass: 'qtjeckjckuouhckk'
  }
});
module.exports = transporter;