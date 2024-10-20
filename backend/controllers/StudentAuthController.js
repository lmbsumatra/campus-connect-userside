const User = require("../models/UserModel");
const Student = require("../models/StudentModel");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const bcrypt = require("bcrypt");

async function verify(token) {
  // Verify the ID token with Google's OAuth2 client
  const ticket = await client.verifyIdToken({
    idToken: token, // The ID token to verify
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  // Return the decoded payload containing user information
  return ticket.getPayload();
}

exports.registerStudent = async (req, res) => {
  const t = await sequelize.transaction(); // Start a new transaction
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      tup_id,
      college,
      scanned_id,
      photo_with_id,
    } = req.body;

    // Check for missing required fields
    if (!first_name)
      return res.status(400).json({ message: "First name is required" });
    if (!last_name)
      return res.status(400).json({ message: "Last name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });
    if (!tup_id) return res.status(400).json({ message: "TUP ID is required" });
    if (!college)
      return res.status(400).json({ message: "College is required" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create(
      {
        first_name,
        middle_name,
        last_name,
        role: "student",
        email,
        password: hashedPassword,
      },
      { transaction: t }
    ); // Include transaction

    // Create a new student record
    const newStudent = await Student.create(
      {
        tup_id,
        user_id: newUser.user_id, // Link to the new user
        college,
        scanned_id,
        photo_with_id,
      },
      { transaction: t }
    ); // Include transaction

    // Commit the transaction
    await t.commit();
    res.status(201).json({
      message: "Student registered successfully",
      student: newStudent,
    });
  } catch (error) {
    // Rollback the transaction if any error occurs
    await t.rollback();
    console.error("Registration error:", error);
    res
      .status(500)
      .json({
        message: "Failed registration. Please check your information",
        error: error.message,
      });
  }
};

// Login a student
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_SECRET
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verify(token);
    const email = payload.email;

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found! Please register first." });
    }

    // If user exists, generate JWT token
    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.status(200).json({ message: "Login successful", token: jwtToken });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
