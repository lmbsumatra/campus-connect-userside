const { models } = require("../../models/index");
const { Op } = require("sequelize");

module.exports = () => async (req, res) => {
  try {
    const reports = await models.TransactionReport.findAll({
      where: {
        status: {
          [Op.or]: ["escalated", "admin_review"], // Fetch reports escalated OR already under admin review
        },
      },
      // Include necessary details for the admin queue view
      include: [
        {
          model: models.User,
          as: "reporter",
          attributes: ["user_id", "first_name", "last_name"],
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["profile_pic"],
              required: false,
            },
          ],
        },
        {
          model: models.User,
          as: "reported",
          attributes: ["user_id", "first_name", "last_name"],
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["profile_pic"],
              required: false,
            },
          ],
        },
        // Maybe include transaction details briefly
        {
          model: models.RentalTransaction,
          as: "rentalTransaction",
          attributes: ["id", "item_id", "transaction_type"],
          required: false,
          include: [
            {
              model: models.Listing,
              attributes: ["id", "listing_name"],
              required: false,
            },
            {
              model: models.ItemForSale,
              attributes: ["id", "item_for_sale_name"],
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]], // Process older escalated reports first
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching escalated transaction reports:", error);
    res.status(500).json({
      error: "Failed to retrieve escalated reports",
      details: error.message,
    });
  }
};
