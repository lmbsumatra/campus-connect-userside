const { models } = require("../../models");

const verifyStudent = async (req, res) => {
  const { token } = req.params;
  const user = await models.User.findOne({
    where: { verification_token: token },
  });

  if (!user || user.verification_token_expiration < new Date()) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification link." });
  }

  user.email_verified = true;
  user.verification_token = null; // Clear the token after successful verification
  user.verification_token_expiration = null;
  await user.save();

  res.status(200).json({ message: "Email successfully verified." });
};

module.exports = verifyStudent;
