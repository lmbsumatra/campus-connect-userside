
const crypto = require('crypto');
const { models } = require("../../models");
const sequelize = require("../../models").sequelize;
const bcrypt = require("bcrypt");
const { rollbackUpload } = require("../../config/multer");
const transporter = require('../../config/nodemailer');

// Register a new student
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

    // Validate required fields
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

    // Check for duplicate email or TUP ID
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const existingStudent = await models.Student.findOne({ where: { tup_id } });
    if (existingStudent) {
      return res.status(409).json({ message: "TUP ID already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save public IDs for cleanup in case of failure
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
        email_verified: false, // Add email_verified flag
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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiration = Date.now() + 3600000; // 1 hour expiration time

    // Save verification token and expiration to the user
    await models.User.update(
      { verification_token: verificationToken, verification_token_expiration: verificationTokenExpiration },
      { where: { user_id: newUser.user_id }, transaction: t }
    );


    const mailOptions = {
      from: 'jione.capstone@gmail.com',
      to: email,
      subject: 'Verify Your Email - Campus Connect',
      html: `
        <p>Welcome to Campus Connect!</p>
        <p>Click the link below to verify your email address:</p>
        <a href="http://localhost:3001/verify-email/${verificationToken}">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email send failed:', error);
        return res.status(500).send("Failed to send email");
      }
      console.log('Email sent:', info.response);
    });

    await t.commit();
    res.status(201).json({
      message: "Student registered successfully. A verification email has been sent.",
      student: newStudent,
    });
  } catch (error) {
    await t.rollback();

    // Rollback uploaded files if any
    if (publicIds.length > 0) {
      await rollbackUpload(publicIds);
    }

    console.error("Registration error:", {
      message: error.message,
      stack: error.stack,
    });

    // Handle validation or database constraint errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
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
