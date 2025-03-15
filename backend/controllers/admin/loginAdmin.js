const User = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const { Op } = require("sequelize");

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    const user = await User.findOne({
      where: {
        email,
        role: {
          [Op.or]: ["admin", "superadmin"],
        },
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login time
    user.lastlogin = new Date();
    await user.save();

    const token = jwt.sign(
      { adminId: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      { adminId: user.user_id, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "5d" } // Long-lived refresh token
    );

    // Debugging: Display tokens
    // Debugging: Log token generation time
    const currentTime = new Date().toLocaleString();
    console.log("Tokens generated at:", currentTime);
    console.log("Generated Access Token:", token);
    console.log("Generated Refresh Token:", refreshToken);

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
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
