// Change Password for Admin
const User = require("../../models/UserModel");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const adminChangePassword = async (req, res) => {
  const adminId = req.adminUser.adminId;
  const { currentPassword, newPassword } = req.body;

  try {
    // Find the admin user
    const admin = await User.findOne({
      where: { user_id: adminId, role: { [Op.or]: ["admin", "superadmin"] } },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    // Hash the new password and save it
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
  }
};

module.exports = adminChangePassword;
