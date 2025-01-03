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

    // Update the user record with verification token
    await models.User.update(
      {
        verification_token: verificationToken,
        verification_token_expiration: verificationTokenExpiration,
      },
      { where: { user_id: newUser.user_id }, transaction: t }
    );

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
