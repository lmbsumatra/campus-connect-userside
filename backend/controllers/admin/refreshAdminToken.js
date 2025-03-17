const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const Admin = require("../../models/AdminModel"); // Import Admin model

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
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    console.log("Refresh token decoded successfully:", decoded);

    // Find the admin in the database using the adminId from the decoded token
    const admin = await Admin.findOne({
      where: {
        user_id: decoded.adminId,
        refreshToken, // Ensure the stored token matches the one provided
      },
    });

    if (!admin) {
      return res
        .status(403)
        .json({ message: "Admin not found or token mismatch." });
    }

    // Generate new tokens
    const token = jwt.sign(
      { adminId: decoded.adminId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "1h" } // Access token expires in 1 hour
    );

    const newRefreshToken = jwt.sign(
      { adminId: decoded.adminId, role: decoded.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "5d" } // Refresh token expires in 5 days
    );

    // Update the refresh token in the Admin model
    admin.refreshToken = newRefreshToken;
    await admin.save();

    // Debugging: Display the new tokens
    const currentTime = new Date().toLocaleString();
    console.log("Tokens refreshed at:", currentTime);
    console.log("New Access Token:", token);
    console.log("New Refresh Token:", newRefreshToken);

    // Send the new tokens to the client
    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

module.exports = refreshAdminToken;
