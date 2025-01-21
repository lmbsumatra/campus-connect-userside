const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Token is required" });
  }

  console.log("Token received:", token);

  // Decode token without verification for logging purposes
  const decodedPayload = jwt.decode(token);
  console.log("Decoded Payload (Unverified):", decodedPayload);

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.status(403).json({ error: "Invalid token" });
    }

    // Attach the verified payload to the request object
    req.user = user;
    console.log("Verified User Payload:", req.user);

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = authenticateToken;
