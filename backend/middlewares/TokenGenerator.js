const jwt = require("jsonwebtoken");

// Load secret key from environment variable or use a fallback
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// Token Maker Component
const TokenGenerator = {
  /**
   * Generates a JWT
   * @param {Object} payload - Data to include in the token.
   * @param {Object} options - Options for the token (e.g., expiration).
   * @returns {string} - Signed JWT token.
   */
  generateToken: (payload, options = {}) => {
    // const defaultOptions = { expiresIn: "1h" }; // Default: 1-hour expiration
    // const tokenOptions = { ...defaultOptions, ...options };
    const tokenOptions = { ...options };

    try {
      const token = jwt.sign(payload, JWT_SECRET, tokenOptions);
      return token;
    } catch (error) {
      console.error("Error generating token:", error.message);
      throw new Error("Failed to generate token");
    }
  },

  /**
   * Verifies a JWT
   * @param {string} token - The JWT to verify.
   * @returns {Object} - Decoded payload if valid.
   * @throws {Error} - If the token is invalid or expired.
   */
  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error("Token verification failed:", error.message);
      throw error;
    }
  },

  /**
   * Decodes a JWT without verifying (for debugging purposes)
   * @param {string} token - The JWT to decode.
   * @returns {Object} - Decoded payload.
   */
  decodeToken: (token) => {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error.message);
      throw new Error("Failed to decode token");
    }
  },
};

module.exports = TokenGenerator;
