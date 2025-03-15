const { models } = require("../../models");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const TokenGenerator = require("../../middlewares/TokenGenerator.js");

const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  // Validation checks
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    // Find user
    const user = await models.User.findOne({ where: { email } });
    // console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is a student
    if (user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not a student" });
    }

    // Compare password
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return res.status(500).json({
        message: "Error verifying credentials",
        error: "Password comparison failed",
      });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login time
    user.lastlogin = new Date();
    await user.save();

    // Generate JWT using TokenMaker
    let token;
    try {
      token = TokenGenerator.generateToken({
        userId: user.user_id,
        role: user.role,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error generating authentication token",
        error: error.message,
      });
    }

    // Respond with success
    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.user_id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};

module.exports = loginStudent;
