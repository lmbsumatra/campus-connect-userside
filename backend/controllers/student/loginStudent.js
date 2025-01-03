const { models } = require("../../models");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  // Validation checks
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    // Find user
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
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

    // JWT token creation
    let token;
    try {
      if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        return res
          .status(500)
          .json({ message: "Server configuration error: Missing JWT secret" });
      }
      token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h", // Optional: Set token expiration
      });
    } catch (error) {
      console.error("Error signing JWT:", error);
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
    if (error.name === "SequelizeConnectionError") {
      console.error("Database connection error:", error);
      return res.status(500).json({
        message: "Database connection error",
        error: error.message,
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      console.error("Database query error:", error);
      return res.status(500).json({
        message: "Database query error",
        error: error.message,
      });
    }

    // Catch-all for unexpected errors
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};

module.exports = loginStudent;
