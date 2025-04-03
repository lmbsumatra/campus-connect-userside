const { models } = require("../models/index");
const { Op } = require("sequelize");

/**
 * checks if a student's restriction has expired and updates accordingly
 */
const checkRestrictions = async (req, res, next) => {
  try {
    // Only proceed if we have a user and they're a student
    if (!req.user || req.user.role !== "student") {
      return next();
    }

    const userId = req.user.userId;
    const now = new Date();

    // Find the student with their current status information
    const student = await models.Student.findOne({
      where: {
        user_id: userId,
        status: "restricted",
        restricted_until: {
          [Op.ne]: null,
          [Op.lte]: now,
        },
      },
    });

    // If we found a student with an expired restriction, update their status
    if (student) {
      await student.update({
        status: "verified",
        status_message: `Restriction expired on ${now.toLocaleDateString()}. Account reactivated`,
        restricted_until: null,
      });

      console.log(
        `User ${userId} restriction expired - status updated to verified upon authentication.`
      );

      // Optionally notify the user their restriction has been lifted
      // if (req.emitNotification) {
      //   await models.StudentNotification.create({
      //     recipient_id: userId,
      //     type: "status_update",
      //     message:
      //       "Your account restriction has expired and your account has been reactivated.",
      //   });

      //   const notification = await models.StudentNotification.findOne({
      //     where: {
      //       recipient_id: userId,
      //       type: "status_update",
      //     },
      //     order: [["createdAt", "DESC"]],
      //   });

      //   if (notification) {
      //     req.emitNotification(userId, notification.toJSON());
      //   }
      // }
    }

    next();
  } catch (error) {
    console.error("Error checking student restrictions:", error);
    // Continue to next middleware even if this check fails
    next();
  }
};

module.exports = checkRestrictions;
