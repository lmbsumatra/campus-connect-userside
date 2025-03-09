require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set in the environment variables.");
  process.exit(1);
}

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token." });

    req.adminUser = decoded; // ✅ Fix: Assign the decoded user to req.adminUser
    console.log("Authenticated Admin:", req.adminUser); // Debugging
    next();
  });
};

module.exports = authenticateToken;
