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
    // Decode the refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Ensure the correct field name
    const adminId = decoded.userId;
    if (!adminId) {
      return res
        .status(403)
        .json({ message: "Invalid refresh token: No user ID." });
    }

    // Find the admin in the database
    const admin = await Admin.findOne({
      where: { user_id: adminId },
    });

    if (!admin || !admin.refreshToken) {
      return res
        .status(403)
        .json({ message: "Refresh token missing or invalid." });
    }

    if (admin.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Refresh token mismatch." });
    }

    // Generate new tokens
    const token = jwt.sign(
      { userId: admin.user_id, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "30m" }
    );
    const newRefreshToken = jwt.sign(
      { userId: admin.user_id, role: decoded.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "5d" }
    );

    // Update the refresh token in the database
    admin.refreshToken = newRefreshToken;
    await admin.save();

    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

module.exports = refreshAdminToken;
