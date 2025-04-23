const Admin = require("../models/AdminModel");

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const user = req.adminUser; // comes from authenticateToken

    // Superadmins always pass
    if (user.role === "superadmin") {
      return next();
    }

    // Only admins beyond this point
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Not an admin." });
    }

    // Fetch admin's permission level from DB
    const adminData = await Admin.findOne({ where: { user_id: user.userId } });

    if (!adminData) {
      return res.status(403).json({ message: "Admin account not found." });
    }

    if (!adminData.permissionLevel) {
      return res.status(403).json({ message: "Access Denied." });
    }

    if (adminData.permissionLevel === "DeniedAccess") {
      return res.status(403).json({ message: "Access Denied." });
    }

    if (
      requiredPermission === "ReadWrite" &&
      adminData.permissionLevel !== "ReadWrite"
    ) {
      return res.status(403).json({ message: "Insufficient Permissions." });
    }

    // Passed permission check
    next();
  };
};

module.exports = checkPermission;
