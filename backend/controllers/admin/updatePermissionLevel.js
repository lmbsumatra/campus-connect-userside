const Admin = require("../../models/AdminModel");
const User = require("../../models/UserModel");
const AuditLog = require("../../models/AuditLogModel");

const updatePermissionLevel = async (req, res) => {
  const { userId, permissionLevel } = req.body;
  const performingAdmin = req.adminUser;

  if (!["ReadOnly", "ReadWrite", "DeniedAccess"].includes(permissionLevel)) {
    return res.status(400).json({ message: "Invalid permission level." });
  }

  try {
    const admin = await Admin.findOne({
      where: { user_id: userId },
      include: [{ model: User, as: "user" }],
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const oldPermission = admin.permissionLevel;

    admin.permissionLevel = permissionLevel;
    await admin.save();

    await AuditLog.create({
      admin_id: performingAdmin.userId,
      role: performingAdmin.role,
      action: "UPDATE_PERMISSION",
      endpoint: "/admin/update-permission",
      details: `Changed permission for ${admin.user.first_name} ${admin.user.last_name} (${admin.user.email}) from ${oldPermission} to ${permissionLevel}`,
    });

    res.status(200).json({ message: "Permission level updated successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update permission level.",
      error: error.message,
    });
  }
};

module.exports = updatePermissionLevel;
