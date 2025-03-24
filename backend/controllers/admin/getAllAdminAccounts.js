// Get all admin and superadmin accounts
const User = require("../../models/UserModel");
const { Op } = require("sequelize");

const getAllAdminAccounts = async (req, res) => {
  try {
    // Fetch all users with the role of admin or superadmin
    const users = await User.findAll({
      where: {
        role: {
          [Op.or]: ["admin", "superadmin"],
        },
      },
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "role",
        "createdAt",
      ],
    });

    res.status(200).json(users);
  } catch (error) {
    // console.error("Error fetching admin accounts:", error);
    res
      .status(500)
      .json({ message: "Error fetching admin accounts", error: error.message });
  }
};

module.exports = getAllAdminAccounts;
