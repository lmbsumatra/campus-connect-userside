const cron = require("node-cron");
const { models } = require("../models/index");
const { Op } = require("sequelize");

/**
 * Finds students with expired 'restricted' status and updates them.
 * This serves as a fallback mechanism for cases where users don't log in.
 */
const expireRestrictionsTask = async () => {
  const now = new Date();

  try {
    const [updatedCount] = await models.Student.update(
      {
        status: "verified", // Change status back to verified
        status_message: `Restriction expired on ${now.toLocaleDateString()}. Account automatically reactivated by system check.`, // Update status message
        restricted_until: null,
      },
      {
        where: {
          status: "restricted", // Only target restricted students
          restricted_until: {
            [Op.ne]: null,
            [Op.lte]: now,
          },
        },
        returning: false,
      }
    );

    if (updatedCount > 0) {
      // console.log(
      //   `[Cron - ExpireRestrictions] Successfully updated status for ${updatedCount} student(s) whose restrictions expired.`
      // );
    }
  } catch (error) {
    console.error(
      `[Cron - ExpireRestrictions] Error updating expired student restrictions:`,
      error
    );
  }
};

const scheduleExpireRestrictions = () => {
  cron.schedule("0 * * * *", expireRestrictionsTask, {
    scheduled: true,
    timezone: "Asia/Manila",
  });
};

module.exports = {
  scheduleExpireRestrictions,
  expireRestrictionsTask,
};
