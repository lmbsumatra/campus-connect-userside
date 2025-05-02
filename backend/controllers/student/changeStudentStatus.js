const { models } = require("../../models");
const StudentNotification = require("../../models/StudentNotificationModel");
const sequelize = require("../../config/database");

const changeStudentStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { studentId, status, statusMessage } = req.body;

    // Check if req.adminUser exists and extract adminId
    const adminId = req.adminUser?.adminId;
    if (!adminId) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ message: "Unauthorized: admin user not found" });
    }

    const student = await models.Student.findByPk(studentId, { transaction });
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ message: "Student not found." });
    }

    // Save previous status to check if there's a change
    const previousStatus = student.status;

    // Update student status
    student.status = status;
    student.status_message = statusMessage;
    await student.save({ transaction });

    // Define custom messages for each status
    const messages = {
      verified: `You now have full platform access.`,
      pending: `Your account verification status has been set to pending`,
      flagged: `Your account has been flagged`,
      banned: `Your account has been banned`,
      restricted: `Your account has been temporarily restricted.`,
    };

    // Create a notification for the student if status changed
    if (previousStatus !== status) {
      const notification = await StudentNotification.create(
        {
          sender_id: adminId,
          recipient_id: student.user_id,
          type: "student_status",
          message:
            messages[status] ||
            `Your account status has been updated to ${status}.`,
          is_read: false,
        },
        { transaction }
      );

      // Emit socket notification if available
      if (req.emitNotification) {
        req.emitNotification(student.user_id, notification.toJSON());
      }
    }

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      message: "Student status updated successfully.",
      status: status,
      statusMessage: statusMessage,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    // console.error("Error updating student status:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = changeStudentStatus;
