const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const Admin = require("../../models/AdminModel");

const refreshAdminToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const admin = await Admin.findOne({ where: { user_id: decoded.userId } });

    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    // Generate new tokens
    const newToken = jwt.sign(
      { userId: admin.user_id, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { userId: admin.user_id, role: decoded.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "3d" }
    );

    // Update in database
    admin.refreshToken = newRefreshToken;
    await admin.save();

    return res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Refresh token expired" });
    }
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

module.exports = refreshAdminToken;
