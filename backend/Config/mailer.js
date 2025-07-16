// mailer.js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, // your Gmail address
    pass: process.env.MAIL_PASSWORD,    // if 2FA is on, use an app password
  },
});

module.exports = transporter;
