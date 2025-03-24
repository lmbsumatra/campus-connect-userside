const AuditLog = require("../../models/AuditLogModel");
const User = require("../../models/UserModel");

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [["timestamp", "DESC"]],
      limit: 50,
      include: [
        {
          model: User,
          as: "admin",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    // console.log("Logs with Admin Info:", JSON.stringify(logs, null, 2)); // ✅ Debugging output

    res.json(logs);
  } catch (error) {
    // console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Error fetching logs" });
  }
};

module.exports = getAuditLogs;
