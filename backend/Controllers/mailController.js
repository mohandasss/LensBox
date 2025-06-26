const Subscriber = require('../Models/Subscribers');
const sendMail = require('../services/sendMail');

/**
 * @desc    Send email to all subscribers
 * @route   POST /api/mail/broadcast
 * @access  Private/Admin
 */
exports.broadcastEmail = async (req, res) => {
  const { title, message } = req.body;

  // Input validation
  if (!title || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title and message are required' 
    });
  }

  try {
    // Get all active subscribers
    const subscribers = await Subscriber.find({ isSubscribed: true });
    
    if (!subscribers.length) {
      return res.status(404).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    // Prepare email content
    const emailPromises = subscribers.map(subscriber => {
      const emailContent = {
        to: subscriber.email,
        subject: title,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${title}</h2>
            <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr>
            <p style="color: #6c757d; font-size: 0.9em;">
              You're receiving this email because you subscribed to our newsletter.
              <br>
              <a href="${process.env.CLIENT_URL}/unsubscribe?email=${subscriber.email}" 
                 style="color: #007bff; text-decoration: none;">
                Unsubscribe
              </a>
            </p>
          </div>
        `
      };
      
      return sendMail(emailContent).catch(error => {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        return { success: false, email: subscriber.email, error: error.message };
      });
    });

    // Send all emails
    const results = await Promise.all(emailPromises);
    
    // Count successful and failed emails
    const successful = results.filter(r => r && r.success).length;
    const failed = results.length - successful;

    res.status(200).json({
      success: true,
      message: `Email broadcast completed`,
      stats: {
        total: results.length,
        successful,
        failed
      },
      details: results
    });

  } catch (error) {
    console.error('Broadcast email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast email',
      error: error.message
    });
  }
};
