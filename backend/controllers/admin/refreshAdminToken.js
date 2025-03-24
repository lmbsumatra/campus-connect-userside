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

    if (!admin) {
      return res.status(403).json({ message: "Admin not found." });
    }

    // Verify the refresh token without checking against stored one
    jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Generate new tokens
    const newToken = jwt.sign(
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

    res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

module.exports = refreshAdminToken;
