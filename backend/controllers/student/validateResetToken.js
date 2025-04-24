const { Op } = require("sequelize");
const { models } = require("../../models");

const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await models.User.findOne({
      where: {
        reset_password_token: token,
        reset_password_token_expiration: {
          [Op.gt]: Date.now(), 
        },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token" });
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to validate token" });
  }
};

module.exports = validateResetToken;