const crypto = require("crypto");
const { models } = require("../../models");
const sequelize = require("../../models").sequelize;
const bcrypt = require("bcrypt");
const { rollbackUpload } = require("../../config/multer");
const transporter = require("../../config/nodemailer");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const registerStudent = async (req, res) => {
  const t = await sequelize.transaction();
  let publicIds = [];

  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      tup_id,
      college,
    } = req.body;

    const { scanned_id, photo_with_id } = req.files;

    // Check for missing fields
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !tup_id ||
      !college ||
      !scanned_id ||
      !photo_with_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing user by email
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Check for existing student by TUP ID
    const existingStudent = await models.Student.findOne({ where: { tup_id } });
    if (existingStudent) {
      return res.status(409).json({ message: "TUP ID already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store uploaded file names for potential rollback
    publicIds.push(scanned_id[0].filename, photo_with_id[0].filename);

    // Create a new user
    const newUser = await models.User.create(
      {
        first_name,
        middle_name,
        last_name,
        role: "student",
        email,
        password: hashedPassword,
        email_verified: false,
      },
      { transaction: t }
    );

    // Create a new student record
    const newStudent = await models.Student.create(
      {
        tup_id,
        user_id: newUser.user_id,
        college,
        scanned_id: scanned_id[0].path,
        photo_with_id: photo_with_id[0].path,
      },
      { transaction: t }
    );

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiration = Date.now() + 3600000; // 1 hour expiration

    const [affectedRows] = await models.User.update(
      {
        verification_token: verificationToken,
        verification_token_expiration: verificationTokenExpiration,
      },
      { where: { user_id: newUser.user_id }, transaction: t }
    );
    console.log(`Affected Rows: ${affectedRows}`);

    const mailOptions = {
      from: "jione.capstone@gmail.com",
      to: email,
      subject: "Verify Your Email - Campus Connect",
      html:
       `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email - Campus Connect</title>
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
        <img src="https://res.cloudinary.com/campusconnectcl/image/upload/v1735845626/cc/eazvmzm29uqxkk6vski3.png" alt="Campus Connect Logo" />
        <span class="logo-text">Campus Connect</span>
      </div>
      
      <hr class="divider" />
      
      <h1 class="header">Verify your email address</h1>
      
      <h6 class="welcome-text">Welcome to Campus Connect!</h6>
      <p class="description">
        Click the button below to verify your email address and make your account active.
      </p>
      
      <a class="verify-button" href="http://localhost:3000/verify-email/${verificationToken}" target="_blank">
        Verify Email
      </a>
      
      <span class="expiration-text">⏰ This link will expire in 5 minutes</span>
      
      <p class="alternative-link">
        If the button above doesn't work, click or copy + paste this link in your browser:
        <br />
        <a class="link" href="http://localhost:3000/verify-email/${verificationToken}">
          http://localhost:3000/verify-email/${verificationToken}
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
        console.error("Email send failed:", error);
        return res.status(500).send("Failed to send email");
      }
      console.log("Email sent:", info.response);
    });

    // Commit transaction if all actions succeed
    await t.commit();

    // Fetch the registered user to ensure all fields are present
    const registeredUser = await models.User.findOne({
      where: { user_id: newUser.user_id },
      attributes: ["user_id", "role"], // Fetch specific fields only
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: registeredUser.user_id, role: registeredUser.role },
      JWT_SECRET
    );

    // Send response
    res.status(201).json({
      message:
        "Student registered successfully. A verification email has been sent.",
      token,
      role: registeredUser.role,
      userId: registeredUser.user_id,
    });
  } catch (error) {
    // Rollback the transaction if anything fails
    await t.rollback();

    // Rollback uploaded files if they exist
    if (publicIds.length > 0) {
      await rollbackUpload(publicIds);
    }

    // Log error and send appropriate response
    console.error("Registration error:", {
      message: error.message,
      stack: error.stack,
    });
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ message: error.errors.map((e) => e.message).join(", ") });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Duplicate entry detected" });
    }

    res.status(500).json({
      message: "Failed registration. Please check your information",
      error: error.message,
    });
  }
};

module.exports = registerStudent;
