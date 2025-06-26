// mailer.js
const nodemailer = require('nodemailer');
const secret = require('../secret');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: secret.MAIL_USER, // your Gmail address
    pass: secret.MAIL_PASSWORD,    // if 2FA is on, use an app password
  },
});

module.exports = transporter;
