const AuditLog = require("../../models/AuditLogModel");

const logAdminLogout = async (req, res) => {
  try {
    const { admin_id, role, action, endpoint, details } = req.body;

    // Insert into the database using Sequelize
    await AuditLog.create({
      admin_id,
      role,
      action,
      endpoint,
      details,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Logout logged successfully" });
  } catch (error) {
    console.error("Error logging logout:", error);
    res.status(500).json({ message: "Error logging logout event" });
  }
};

module.exports = {
  logAdminLogout,
};

module.exports = logAdminLogout;
