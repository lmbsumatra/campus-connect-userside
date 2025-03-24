const { models } = require("../../models");
const { Op } = require("sequelize");

const verifyStudent = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      console.error("No token provided.");
      return res.status(400).json({ message: "No token provided." });
    }

    console.log("Received verification token:", token);

    // Find user with the provided token and check if it's already verified
    const user = await models.User.findOne({
      where: {
        verification_token: token,
      },
    });

    if (!user) {
      console.error("Token not found in the database.");
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    // Check if the user has already verified their email
    if (user && user.email_verified && user.verification_token_expiration === null) {
      console.log("Email already verified for user ID:", user.id);
      return res.status(200).json({ message: "Email already verified." });
    }

    // Check if the verification token has expired
    if (!user.email_verified && user.verification_token_expiration < new Date()) {
      console.error("Token expired for user ID:", user.id);
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    // Proceed with verifying the email
    user.email_verified = true;
    user.verification_token_expiration = null; // Clear expiration after successful verification
    await user.save();

    console.log("Email verified successfully for user ID:", user.id);
    return res.status(200).json({ message: "Email successfully verified." });

  } catch (error) {
    console.error("Error during email verification:", error);
    return res.status(500).json({ message: "An internal server error occurred." });
  }
};

module.exports = verifyStudent;
