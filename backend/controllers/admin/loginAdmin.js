// Login an admin
const User = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { Op } = require("sequelize");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    // Find user by email
    const user = await User.findOne({
      where: {
        email,
        role: {
          [Op.or]: ["admin", "superadmin"], // nilagyan ko lang superadmin
        },
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: user.user_id, role: user.role }, // Change from userId to adminId
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

module.exports = loginAdmin;
