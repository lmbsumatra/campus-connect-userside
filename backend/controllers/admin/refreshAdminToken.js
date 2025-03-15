const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const refreshAdminToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.log("No refresh token provided in request body.");
    return res
      .status(401)
      .json({ message: "Access denied. No refresh token provided." });
  }

  // Debugging: Display the refresh token being used
  console.log("Refresh token received:", refreshToken);

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    console.log("Refresh token decoded successfully:", decoded);

    const token = jwt.sign(
      { adminId: decoded.adminId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { adminId: decoded.adminId, role: decoded.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "5d" }
    );

    // Debugging: Display the new tokens
    // Debugging: Log token refresh time
    const currentTime = new Date().toLocaleString();
    console.log("Tokens refreshed at:", currentTime);
    console.log("New Access Token:", token);
    console.log("New Refresh Token:", newRefreshToken);

    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

module.exports = refreshAdminToken;
