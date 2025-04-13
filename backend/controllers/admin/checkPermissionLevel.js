const Admin = require("../../models/AdminModel");

const checkPermissionLevel = async (req, res) => {
  const user = req.adminUser;

  // Superadmins bypass permission levels
  if (user.role === "superadmin") {
    return res.status(200).json({ permissionLevel: "SuperAdmin" });
  }

  try {
    const admin = await Admin.findOne({ where: { user_id: user.userId } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ permissionLevel: admin.permissionLevel });
  } catch (error) {
    console.error("Permission check error:", error);
    res
      .status(500)
      .json({ message: "Failed to check permission", error: error.message });
  }
};

module.exports = checkPermissionLevel;
