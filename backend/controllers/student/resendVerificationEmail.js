const crypto = require("crypto");
const { models } = require("../../models");
const transporter = require("../../config/nodemailer");

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // console.log(req.body)

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if the user exists
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the email is already verified
    if (user.email_verified) {
      return res
        .status(400)
        .json({ message: "Email is already verified" });
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiration = Date.now() + 3600000; // 1 hour expiration

    // Update the user with the new token
    await models.User.update(
      {
        verification_token: verificationToken,
        verification_token_expiration: verificationTokenExpiration,
      },
      { where: { user_id: user.user_id } }
    );

    // Send verification email
    const mailOptions = {
      from: "jione.capstone@gmail.com",
      to: email,
      subject: "Resend Email Verification - RenTUPeers",
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Your Email - RenTUPeers</title>
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
      
            .welcome-text {
              font-size: 18px;
              color: #2d3748;
              margin-bottom: 8px;
              font-weight: 600;
            }
      
            .description {
              font-size: 16px;
              color: #4a5568;
              margin-bottom: 24px;
              line-height: 1.6;
            }
      
            .verify-button {
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
      
            .verify-button:hover {
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
      
            @media (max-width: 600px) {
              .container-content.email {
                padding: 24px;
                margin: 10px;
                width: auto;
              }
      
              .header {
                font-size: 26px;
              }
      
              .welcome-text {
                font-size: 16px;
              }
      
              .description {
                font-size: 15px;
              }
      
              .verify-button {
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
              <img src="https://res.cloudinary.com/campusconnectcl/image/upload/v1735845626/cc/eazvmzm29uqxkk6vski3.png" alt="RenTUPeers Logo" />
              <span class="logo-text">RenTUPeers</span>
            </div>
            
            <hr class="divider" />
            
            <h1 class="header">Verify your email address</h1>
            
            <h6 class="welcome-text">Welcome to RenTUPeers!</h6>
            <p class="description">
              Click the button below to verify your email address and make your account active.
            </p>
            
            <a class="verify-button" href="https://rentupeers.shop/verify-email/${verificationToken}" target="_blank">
              Verify Email
            </a>
            
            <span class="expiration-text">⏰ This link will expire in 5 minutes</span>
            
            <p class="alternative-link">
              If the button above doesn't work, click or copy + paste this link in your browser:
              <br />
              <a class="link" href="https://rentupeers.shop/verify-email/${verificationToken}">
                https://rentupeers.shop/verify-email/${verificationToken}
              </a>
            </p>
            
            <hr class="divider" />
            
            <p class="contact-section">
              If you didn't request this email or if you think something is wrong, contact us at
              <a class="link" href="mailto:campusconnect@gmail.com">campusconnect@gmail.com</a>.
              We'd love to help.
            </p>
          </div>
        </body>
      </html>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.error("Failed to send email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      // console.log("Email sent:", info.response);
      res.status(200).json({ message: "Verification email resent" });
    });
  } catch (error) {
    // console.error("Error resending verification email:", error);
    res
      .status(500)
      .json({ message: "Failed to resend verification email" });
  }
};

module.exports = resendVerificationEmail;
