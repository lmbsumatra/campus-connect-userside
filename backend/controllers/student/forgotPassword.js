const crypto = require("crypto");
const { models } = require("../../models");
const transporter = require("../../config/nodemailer");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await models.User.findOne({ where: { email } });
    if (!user) {

      return res.status(200).json({
        message:
          "If your email exists in our system, you will receive a password reset link",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; 

    await models.User.update(
      {
        reset_password_token: resetToken,
        reset_password_token_expiration: resetTokenExpiration,
      },
      { where: { user_id: user.user_id } }
    );

    const mailOptions = {
      from: "jione.capstone@gmail.com",
      to: email,
      subject: "Password Reset - Campus Connect",
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Your Password - Campus Connect</title>
          <style>
            .container-content.email {
              padding: 40px;
              margin: 20px auto;
              border: 1px solid #e1e4e8;
              border-radius: 12px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              background-color: white;
              max-width: 600px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
      
            .container-content.email img {
              height: 45px;
              margin-right: 12px;
            }
      
            .logo-section {
              display: flex;
              align-items: center;
              margin-bottom: 24px;
            }
      
            .logo-text {
              font-size: 22px;
              font-weight: 600;
              color: #2c3e50;
              letter-spacing: -0.5px;
            }
      
            .divider {
              border: none;
              border-top: 1px solid #e1e4e8;
              margin: 24px 0;
            }
      
            .header {
              font-size: 32px;
              margin-bottom: 16px;
              color: #1a202c;
              font-weight: 600;
              letter-spacing: -0.5px;
            }
      
            .description {
              font-size: 16px;
              color: #4a5568;
              margin-bottom: 24px;
              line-height: 1.6;
            }
      
            .reset-button {
              display: inline-block;
              background-color: #0056b3;
              color: white;
              font-size: 16px;
              font-weight: 500;
              padding: 12px 28px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              text-decoration: none;
              transition: all 0.2s ease;
              margin-bottom: 16px;
            }
      
            .reset-button:hover {
              background-color: #004494;
              transform: translateY(-1px);
            }
      
            .expiration-text {
              font-size: 14px;
              color: #718096;
              margin-top: 12px;
              display: block;
            }
      
            .alternative-link {
              font-size: 14px;
              color: #4a5568;
              margin-top: 20px;
              line-height: 1.6;
            }
      
            .link {
              color: #0056b3;
              text-decoration: none;
              word-break: break-all;
            }
      
            .link:hover {
              text-decoration: underline;
            }
      
            .contact-section {
              font-size: 14px;
              color: #718096;
              margin-top: 24px;
              line-height: 1.6;
            }
      
            .security-note {
              font-size: 14px;
              color: #e53e3e;
              margin-top: 24px;
              line-height: 1.6;
              padding: 12px;
              background-color: #fff5f5;
              border-radius: 6px;
              border-left: 4px solid #e53e3e;
            }
      
            @media (max-width: 600px) {
              .container-content.email {
                padding: 24px;
                margin: 10px;
                width: auto;
              }
      
              .header {
                font-size: 26px;
              }
      
              .description {
                font-size: 15px;
              }
      
              .reset-button {
                font-size: 15px;
                padding: 10px 24px;
                width: 100%;
                text-align: center;
              }
            }
          </style>
        </head>
        <body>
          <div class="container-content email">
            <div class="logo-section">
              <img src="https://res.cloudinary.com/campusconnectcl/image/upload/v1735845626/cc/eazvmzm29uqxkk6vski3.png" alt="Campus Connect Logo" />
              <span class="logo-text">Campus Connect</span>
            </div>
            
            <hr class="divider" />
            
            <h1 class="header">Reset Your Password</h1>
            
            <p class="description">
              We received a request to reset your password for your Campus Connect account. Click the button below to create a new password.
            </p>
            
            <a class="reset-button" href="http://localhost:3000/reset-password/${resetToken}" target="_blank">
              Reset Password
            </a>
            
            <span class="expiration-text">⏰ This link will expire in 1 hour</span>
            
            <p class="alternative-link">
              If the button above doesn't work, click or copy + paste this link in your browser:
              <br />
              <a class="link" href="http://localhost:3000/reset-password/${resetToken}">
                http://localhost:3000/reset-password/${resetToken}
              </a>
            </p>
            
            <div class="security-note">
              If you didn't request a password reset, please ignore this email or contact support - your account is still secure.
            </div>
            
            <hr class="divider" />
            
            <p class="contact-section">
              If you need any help, contact us at
              <a class="link" href="mailto:campusconnect@gmail.com">campusconnect@gmail.com</a>.
              We're here to assist you.
            </p>
          </div>
        </body>
      </html>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.error("Failed to send password reset email:", error);
        return res
          .status(500)
          .json({ message: "Failed to send password reset email" });
      }
      res.status(200).json({
        message:
          "If your email exists in our system, you will receive a password reset link",
      });
    });
  } catch (error) {
    // console.error("Error sending password reset email:", error);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
};

module.exports = forgotPassword;
