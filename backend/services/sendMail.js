// services/sendMail.js
const transporter = require('../Config/mailer');
const secret = require('../secret');

/**
 * Send an email with optional attachments
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text version of the email
 * @param {string} [options.html] - HTML version of the email
 * @param {Array} [options.attachments] - Array of attachment objects
 * @returns {Promise<Object>} - Nodemailer response
 */
const sendMail = async ({ to, subject, text, html, attachments }) => {
  const mailOptions = {
    from: `"LensBox" <${secret.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mail sent:', info.response);
    return { success: true, info };
  } catch (err) {
    console.error('❌ Mail error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to send email',
      details: err 
    };
  }
};

/**
 * Send a purchase confirmation email with invoice attachment
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.orderId - Order ID
 * @param {string} options.customerName - Customer's name
 * @param {Buffer} options.invoiceBuffer - Invoice PDF buffer
 * @returns {Promise<Object>} - Result of sending email
 */


/**
 * Send a welcome email to new subscribers
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Subscriber's name
 * @returns {Promise<Object>} - Result of sending email
 */
const sendWelcomeEmail = async ({ to, name }) => {
  const subject = 'Welcome to LensBox - Thank You for Subscribing!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Welcome to LensBox, ${name || 'Valued Customer'}!</h2>
      <p>Thank you for subscribing to our newsletter. You'll be the first to know about:</p>
      <ul>
        <li>New product launches</li>
        <li>Exclusive offers and discounts</li>
        <li>Photography tips and tutorials</li>
        <li>Upcoming events and workshops</li>
      </ul>
      <p>We're excited to have you as part of our photography community!</p>
      <p>If you ever wish to unsubscribe, you can do so by clicking the link at the bottom of any of our emails.</p>
      <p>Happy shooting!<br>The LensBox Team</p>
    </div>
  `;

  return sendMail({
    to,
    subject,
    html
  });
};

module.exports = {
  sendMail,
  
  sendWelcomeEmail
};
