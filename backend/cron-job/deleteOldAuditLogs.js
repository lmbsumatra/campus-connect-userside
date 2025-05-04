const cron = require("node-cron");
const { Op } = require("sequelize");
const AuditLog = require("../models/AuditLogModel");

cron.schedule("0 2 * * *", async () => {
  // Daily at 2 AM
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const deletedCount = await AuditLog.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
      },
    });

    console.log(`[AuditLog Cleanup] ${deletedCount} old logs deleted.`);
  } catch (error) {
    console.error("[AuditLog Cleanup] Error:", error);
  }
});
