const AuditLog = require("../models/AuditLogModel");

const logAdminActivity = async (req, res, next) => {
  try {
    if (!req.adminUser) {
      return next(); // Skip logging if adminUser is missing
    }

    const { adminId, role } = req.adminUser;
    const { method, originalUrl, body } = req;

    // ✅ Remove sensitive fields
    const sanitizedBody = { ...body };
    delete sanitizedBody.currentPassword;
    delete sanitizedBody.newPassword;
    delete sanitizedBody.confirmPassword;

    await AuditLog.create({
      admin_id: adminId,
      role,
      action: method,
      endpoint: originalUrl,
      details: JSON.stringify(sanitizedBody),
    });

    next();
  } catch (error) {
    // console.error("Error logging admin activity:", error);
    next(); // Continue execution even if logging fails
  }
};

module.exports = logAdminActivity;
