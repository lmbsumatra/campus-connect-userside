const AuditLog = require("../../models/AuditLogModel");
const { Op } = require("sequelize"); // ✅ Import Op for date comparison

const logAdminLogout = async (req, res) => {
  try {
    const { admin_id, role, action, endpoint, details } = req.body;

    // ✅ Check if a logout log exists within the last 10 seconds
    const existingLog = await AuditLog.findOne({
      where: {
        admin_id,
        action: "Logout",
        endpoint: "/admin/logout",
        timestamp: {
          [Op.gte]: new Date(Date.now() - 4 * 1000),
        },
      },
    });

    if (existingLog) {
      console.log(
      //   "Duplicate logout detected within 10 seconds, skipping log entry."
      // );
      return res.status(200).json({ message: "Duplicate logout ignored" });
    }

    // ✅ If no recent logout log exists, insert a new one
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

module.exports = logAdminLogout;
