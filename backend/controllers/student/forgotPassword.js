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

    if (
      user.reset_password_token_expiration &&
      user.reset_password_token_expiration > Date.now()
    ) {
      const timeRemaining = Math.ceil(
        (user.reset_password_token_expiration - Date.now()) / 60000
      );

      return res.status(200).json({
        hasActiveRequest: true,
        waitTime: timeRemaining,
        message: `A password reset link has already been sent. Please check your email or try again after ${timeRemaining} minutes.`,
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
      subject: "Password Reset - RenTUPeers",
      html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password - RenTUPeers</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        background-color: #f7f9fc;
        color: #333;
      }
      
      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }
      
      .email-header {
        background-color: #f0f4f9;
        padding: 24px 32px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e5e9f0;
      }
      
      .email-header img {
        height: 45px;
        margin-right: 16px;
      }
      
      .email-header-title {
        font-size: 22px;
        font-weight: 700;
        color: #2c3e50;
        letter-spacing: -0.5px;
      }
      
      .email-body {
        padding: 32px;
      }
      
      .email-title {
        font-size: 28px;
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 16px;
        letter-spacing: -0.5px;
      }
      
      .email-text {
        font-size: 16px;
        line-height: 1.6;
        color: #4a5568;
        margin-bottom: 24px;
      }
      
      .reset-button {
        display: inline-block;
        background-color: #0056b3;
        color: #ffffff !important;
        font-size: 16px;
        font-weight: 600;
        padding: 14px 32px;
        border-radius: 8px;
        text-decoration: none;
        transition: all 0.2s ease;
        margin-bottom: 16px;
      }
      
      .reset-button:hover {
        background-color: #004494;
      }
      
      .expiration-notice {
        font-size: 14px;
        color: #718096;
        margin-top: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .alt-link-section {
        margin-top: 24px;
        padding: 16px;
        background-color: #f8fafc;
        border-radius: 8px;
        font-size: 14px;
        color: #4a5568;
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
      
      .security-alert {
        margin-top: 28px;
        padding: 16px;
        background-color: #fff5f5;
        border-radius: 8px;
        border-left: 4px solid #e53e3e;
        font-size: 14px;
        color: #e53e3e;
        line-height: 1.6;
      }
      
      .email-divider {
        height: 1px;
        background-color: #e5e9f0;
        border: none;
        margin: 32px 0;
      }
      
      .email-footer {
        padding: 24px 32px;
        background-color: #f0f4f9;
        font-size: 14px;
        color: #718096;
        text-align: center;
        border-top: 1px solid #e5e9f0;
      }
      
      .support-section {
        padding: 0 0 16px 0;
        font-size: 14px;
        color: #718096;
        line-height: 1.6;
      }
      
      @media (max-width: 600px) {
        .email-container {
          margin: 20px;
          width: auto;
        }
        
        .email-header, .email-body, .email-footer {
          padding: 20px;
        }
        
        .email-title {
          font-size: 24px;
        }
        
        .reset-button {
          display: block;
          text-align: center;
          padding: 12px 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <img src="https://res.cloudinary.com/campusconnectcl/image/upload/v1735845626/cc/eazvmzm29uqxkk6vski3.png" alt="RenTUPeers Logo" />
        <div class="email-header-title">RenTUPeers</div>
      </div>
      
      <div class="email-body">
        <h1 class="email-title">Reset Your Password</h1>
        
        <p class="email-text">
          We received a request to reset your password for your RenTUPeers account. Click the button below to create a new password.
        </p>
        
        <a class="reset-button" href="https://rentupeers.shop/reset-password/${resetToken}" target="_blank">
          Reset Password
        </a>
        
        <div class="expiration-notice">
          <span>⏰ This link will expire in 1 hour</span>
        </div>
        
        <div class="alt-link-section">
          If the button above doesn't work, click or copy + paste this link in your browser:
          <br />
          <a class="link" href="https://rentupeers.shop/reset-password/${resetToken}">
            https://rentupeers.shop/reset-password/${resetToken}
          </a>
        </div>
        
        <div class="security-alert">
          If you didn't request a password reset, please ignore this email or contact support - your account is still secure.
        </div>
        
        <hr class="email-divider" />
        
        <div class="support-section">
          If you need any help, contact us at
          <a class="link" href="mailto:jione.capstone@gmail.com">rentupeers.team@tup.edu.ph</a>.
          We're here to assist you.
        </div>
      </div>
      
      <div class="email-footer">
        © ${new Date().getFullYear()} RenTUPeers · All rights reserved.
      </div>
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
