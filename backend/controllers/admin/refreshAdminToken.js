const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const Admin = require("../../models/AdminModel");

const refreshAdminToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Access denied. No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const adminId = decoded.userId;

    if (!adminId) {
      return res
        .status(403)
        .json({ message: "Invalid refresh token: No user ID." });
    }

    // Find the admin in the database
    const admin = await Admin.findOne({ where: { user_id: adminId } });

    if (!admin || !admin.refreshToken) {
      return res
        .status(403)
        .json({ message: "Refresh token missing or invalid." });
    }

    // ✅ Convert refreshToken to an array (if it isn't already)
    const storedTokens = Array.isArray(admin.refreshToken)
      ? admin.refreshToken
      : [admin.refreshToken];

    if (!storedTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Refresh token mismatch." });
    }

    // Generate new tokens
    const token = jwt.sign(
      { userId: admin.user_id, role: decoded.role },
      JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

    const newRefreshToken = jwt.sign(
      { userId: admin.user_id, role: decoded.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "5d" }
    );

    // ✅ Append new refresh token instead of replacing
    const updatedTokens = [
      ...storedTokens.filter((t) => t !== refreshToken),
      newRefreshToken,
    ];

    // Update refresh tokens in database
    admin.refreshToken = updatedTokens;
    await admin.save();

    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

module.exports = refreshAdminToken;
