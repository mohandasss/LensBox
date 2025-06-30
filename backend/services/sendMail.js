// services/sendMail.js
const transporter = require('../Config/mailer');
const secret = require('../secret');
const Order = require('../Models/orderModel');
const { getEmailHeader, getEmailFooter } = require('./emailTemplates');


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


const sendPurchaseConfirmationEmail = async ({ to, name, orderId, items, total, addressLine1 }) => {
  console.log(items);
  const subject = 'Thank You for Your Purchase! 🎉';
  
  const html = getEmailHeader(`Thank You for Your Purchase! ${name || 'Valued Customer'}`) + `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f8f9fa; padding: 0;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Thank You for Your Purchase!</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your order has been confirmed</p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 40px 30px;">
        
        <!-- Greeting -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">Hi ${name || 'Valued Customer'},</h2>
          <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">We're excited to confirm that your order has been received and is being processed. Here are your order details:</p>
        </div>
        
        <!-- Order Summary Card -->
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #667eea;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="color: #333; margin: 0; font-size: 18px;">Order Summary</h3>
            <span style="background-color: #e8f5e8; color: #2d6a2d; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">CONFIRMED</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #333; font-size: 14px;">Order ID:</strong>
            <span style="color: #667eea; font-weight: 600; margin-left: 8px; font-family: monospace;">#${orderId}</span>
          </div>
          
          <div>
            <strong style="color: #333; font-size: 14px;">Total Amount:</strong>
            <span style="color: #28a745; font-weight: 700; font-size: 18px; margin-left: 8px;">₹${total}</span>
          </div>
        </div>
        
        <!-- Items Section -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Items Ordered</h3>
          <div style="background-color: white; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
            ${items.map((item, index) => `
              <div style="padding: 15px 20px; ${index !== items.length - 1 ? 'border-bottom: 1px solid #f0f0f0;' : ''} display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="color: #333; font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                  <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
                </div>
                <div style="text-align: right;">
                  <div style="color: #333; font-weight: 600;">₹${item.price}</div>
                  <div style="color: #666; font-size: 12px;">per item</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Shipping Address -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Shipping Address</h3>
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef;">
            <p style="color: #333; margin: 0; font-size: 15px; line-height: 1.4;">📍 ${addressLine1}</p>
          </div>
        </div>
        
        <!-- What's Next -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
          <ul style="color: rgba(255, 255, 255, 0.9); margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>You'll receive a tracking number once your order ships</li>
            <li>We'll send you updates via email and SMS</li>
            <li>Estimated delivery: 3-5 business days</li>
          </ul>
        </div>
        
        <!-- Footer Message -->
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e9ecef;">
          <p style="color: #666; margin: 0 0 15px 0; font-size: 16px;">Thank you for choosing LensBox! We hope you love your new purchase.</p>
          <p style="color: #666; margin: 0; font-size: 14px;">Questions? Contact our support team - we're here to help!</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #333; color: white; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Happy Shopping! 🛍️</p>
        <p style="margin: 0; color: #ccc; font-size: 14px;">The LensBox Team</p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #555;">
          <p style="margin: 0; color: #999; font-size: 12px;">This email was sent to ${to}</p>
        </div>
      </div>
    </div>
  ` + getEmailFooter();

  return sendMail({
    to,
    subject,
    html
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
