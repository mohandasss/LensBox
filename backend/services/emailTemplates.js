const getEmailHeader = (title) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style type="text/css">
    /* Client-specific resets */
    body, html { 
      margin: 0 !important; 
      padding: 0 !important;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      font-family: Arial, sans-serif;
    }
    
    /* What it does: Prevents Windows 10 Mail from underlining links */
    a { 
      text-decoration: none;
    }
    
    /* What it does: Uses a better rendering method when resizing images in IE. */
    img { 
      -ms-interpolation-mode: bicubic; 
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    
    /* What it does: Forces Outlook.com to display emails at full width. */
    .email-container {
      width: 100% !important;
      margin: 0 auto;
      max-width: 600px;
      background-color: #ffffff;
    }
    
    /* What it does: Centers email on Android 4.4 */
    div[style*="margin: 16px 0"] { 
      margin: 0 !important; 
    }
    
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      
      .content {
        padding: 20px 15px !important;
      }
      
      .footer {
        padding: 15px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.6; color: #333333;">
  <!-- Email Container -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa;">
    <tr>
      <td align="center" valign="top">
        <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; max-width: 600px; width: 100%;">
          <!-- Banner Image -->
          <tr>
            <td style="padding: 0;">
              <img 
                src="https://res.cloudinary.com/dk5gtjb3k/image/upload/v1751205404/Screenshot_2025-06-29_192640_aqzmwq.png" 
                alt="LensBox - Your Photography Gear Partner" 
                width="600" 
                style="width: 100%; max-width: 600px; height: auto; display: block;"
                border="0"
              >
            </td>
          </tr>
          <!-- Email Content Wrapper -->
          <tr>
            <td class="content" style="padding: 30px;" bgcolor="#ffffff">
`;

/**
* Generates the footer for all LensBox emails
* @returns {string} HTML string for the email footer
*/
const getEmailFooter = () => `
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td class="footer" style="background-color: #333333; color: #ffffff; padding: 25px 30px; text-align: center; font-size: 14px; line-height: 1.6;" bgcolor="#333333">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding: 0 0 15px 0;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="color: #ffffff; text-decoration: none; margin: 0 10px; display: inline-block;">Shop</a>
                  <span style="color: #666666; margin: 0 5px;">|</span>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/about" style="color: #ffffff; text-decoration: none; margin: 0 10px; display: inline-block;">About Us</a>
                  <span style="color: #666666; margin: 0 5px;">|</span>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/contact" style="color: #ffffff; text-decoration: none; margin: 0 10px; display: inline-block;">Contact</a>
                </td>
              </tr>
              <tr>
                <td style="color: #aaaaaa; padding: 0 0 10px 0; font-size: 13px;">
                  &copy; ${new Date().getFullYear()} LensBox. All rights reserved.
                </td>
              </tr>
              <tr>
                <td style="color: #888888; padding: 0; font-size: 12px; line-height: 1.5;">
                  You're receiving this email because you signed up for updates from LensBox.<br>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe" style="color: #aaaaaa; text-decoration: underline;">Unsubscribe</a> 
                  <span style="color: #666666; margin: 0 5px;">|</span>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/preferences" style="color: #aaaaaa; text-decoration: underline;">Email Preferences</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

module.exports = {
  getEmailHeader,
  getEmailFooter
};
