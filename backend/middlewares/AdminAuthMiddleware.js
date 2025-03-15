require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error(
    "JWT_SECRET or JWT_REFRESH_SECRET is not set in the environment variables."
  );
  process.exit(1);
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided in request headers.");
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // Debugging: Display the token being validated
  console.log("Token being validated:", token);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token validation failed:", err.message);
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.adminUser = decoded;
    console.log("Token decoded successfully:", decoded);
    next();
  });
};

const authenticateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.log("No refresh token provided in request body.");
    return res
      .status(401)
      .json({ message: "Access denied. No refresh token provided." });
  }

  // Debugging: Display the refresh token being validated
  console.log("Refresh token being validated:", refreshToken);

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      console.log("Refresh token validation failed:", err.message);
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token." });
    }

    req.adminUser = decoded;
    console.log("Refresh token decoded successfully:", decoded);
    next();
  });
};

module.exports = { authenticateToken, authenticateRefreshToken };
