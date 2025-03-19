const { models } = require("../../models/index");
const StudentNotification = require("../../models/StudentNotificationModel");
const { Op } = require("sequelize");
const sequelize = require("../../config/database");

const updateItemForSaleStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.adminUser?.adminId;

    if (!adminId) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: "Unauthorized: admin user not found" });
    }

    const item = await models.ItemForSale.findByPk(id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: "Item not found" });
    }

    await item.update({ status }, { transaction });

    // Notification messages
    const messages = {
      approved: `Item approved: ${item.item_for_sale_name}`,
      declined: `Item declined: ${item.item_for_sale_name}. Reason: ${reason}`,
      removed: `Item removed: ${item.item_for_sale_name}. Reason: ${reason}`,
      revoked: `Item reinstated: ${item.item_for_sale_name}`,
      flagged: `Item flagged: ${item.item_for_sale_name}. Reason: ${reason}`,
    };

    // Create owner notification
    const notification = await StudentNotification.create(
      {
        sender_id: adminId,
        recipient_id: item.seller_id,
        type: "item_status",
        message: messages[status] || "Your item status was updated",
        is_read: false,
        item_for_sale_id: item.id,
      },
      { transaction }
    );

    // Notify all students when approved
    if (status === "approved") {
      const students = await models.User.findAll({
        where: {
          role: "student",
          user_id: { [Op.ne]: item.seller_id },
        },
        attributes: ["user_id"],
        transaction,
      });

      const studentNotifications = await StudentNotification.bulkCreate(
        students.map((student) => ({
          sender_id: item.seller_id,
          recipient_id: student.user_id,
          type: "new-item-for-sale",
          message: `New item "${item.item_for_sale_name}" is now available for purchase!`,
          item_for_sale_id: item.id,
          is_read: false,
        })),
        { transaction }
      );

      studentNotifications.forEach((notif) => {
        if (req.emitNotification) {
          req.emitNotification(notif.recipient_id, notif.toJSON());
        }
      });
    }

    await transaction.commit();
    res.json({ message: "Status updated successfully", notification });
  } catch (error) {
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }
    console.error("Error updating status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = updateItemForSaleStatus;
