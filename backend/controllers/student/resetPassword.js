const { Op } = require("sequelize");
const { models, sequelize } = require("../../models");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await models.User.update(
      {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_token_expiration: null,
      },
      { where: { user_id: user.user_id } }
    );

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    // console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

module.exports = resetPassword;
