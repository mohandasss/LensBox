// utils/sendMail.js
const transporter = require('../Config/mailer');

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"LensBox" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mail sent:', info.response);
    return info;
  } catch (err) {
    console.error('❌ Mail error:', err);
    throw err;
  }
};

module.exports = sendMail;
