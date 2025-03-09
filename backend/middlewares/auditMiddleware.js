const AuditLog = require("../models/AuditLogModel");

const logAdminActivity = async (req, res, next) => {
  try {
    if (!req.adminUser) {
      // ✅ Use req.adminUser instead of req.user
      console.error("Audit log error: No admin details found in request.");
      return next();
    }

    const { adminId, role } = req.adminUser; // ✅ Use req.adminUser
    const { method, originalUrl, body } = req;

    await AuditLog.create({
      admin_id: adminId,
      role,
      action: method,
      endpoint: originalUrl,
      details: JSON.stringify(body),
    });

    next();
  } catch (error) {
    console.error("Error logging admin activity:", error);
    next(); // Continue execution even if logging fails
  }
};

module.exports = logAdminActivity;
