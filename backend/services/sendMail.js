// services/sendMail.js
const transporter = require('../Config/mailer');
const Order = require('../Models/orderModel');
const { getEmailHeader, getEmailFooter } = require('./emailTemplates');

const sendMail = async ({ to, subject, text, html, attachments }) => {
  const mailOptions = {
    from: `"LensBox" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { 
      success: true, 
      info: {
        messageId: info.messageId,
        response: info.response
      }
    };
  } catch (err) {
    return { 
      success: false, 
      error: 'Failed to send email',
      details: err.message 
    };
  }
};


const sendPurchaseConfirmationEmail = async ({ to, name, orderId, items, total, addressLine1, attachments }) => {
  console.log(items);
  const subject = 'Order Confirmation - LensBox';
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #e5e5e5; padding-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">LensBox</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; color: #666;">Order Confirmation</p>
      </div>
      
      <!-- Greeting -->
      <div style="margin-bottom: 30px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${name || 'there'},</p>
        <p style="margin: 0; font-size: 16px;">Thank you for your order. We've received your payment and your order is being processed.</p>
      </div>
      
      <!-- Order Details -->
      <div style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Order Details</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Total:</strong> ₹${total}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> Confirmed</p>
        </div>
      </div>
      
      <!-- Items -->
      <div style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Items</h2>
        ${items.map(item => `
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e5e5;">
            <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: 500;">${item.name}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">Quantity: ${item.quantity} × ₹${item.price} = ₹${item.total}</p>
          </div>
        `).join('')}
      </div>
      
      <!-- Shipping Address -->
      <div style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Shipping Address</h2>
        <p style="margin: 0; font-size: 14px; color: #666;">${addressLine1}</p>
      </div>
      
      <!-- Invoice Notice -->
      ${attachments ? `
      <div style="margin-bottom: 30px; padding: 15px; background-color: #f0f8ff; border-left: 4px solid #0066cc; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #333;">
          <strong>Invoice attached:</strong> Your detailed invoice is attached to this email for your records.
        </p>
      </div>
      ` : ''}
      
      <!-- Next Steps -->
      <div style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What happens next?</h2>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666;">
          <li>We'll process your order and prepare it for shipping</li>
          <li>You'll receive a tracking number once your order ships</li>
          <li>Estimated delivery: 3-5 business days</li>
        </ul>
      </div>
      
      <!-- Support -->
      <div style="margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Need help?</strong></p>
        <p style="margin: 0; font-size: 14px; color: #666;">Contact us at support@lensbox.in or call +91-6295631554</p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px;">
        <p style="margin: 0 0 5px 0;">LensBox</p>
        <p style="margin: 0 0 5px 0;">B-6, Kolkata, West Bengal, 700001</p>
        <p style="margin: 0;">This email was sent to ${to}</p>
      </div>
      
    </div>
  `;

  return sendMail({
    to,
    subject,
    html,
    attachments
  });
};;




  
 
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
  sendWelcomeEmail,
  sendPurchaseConfirmationEmail
};
