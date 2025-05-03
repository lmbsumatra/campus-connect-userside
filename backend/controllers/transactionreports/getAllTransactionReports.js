const { Op } = require("sequelize");
const { models } = require("../../models");

module.exports = () => async (req, res) => {
  try {
    const reports = await models.TransactionReport.findAll({
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
        // Evidence
        {
          model: models.TransactionEvidence,
          as: "evidence",
          attributes: ["id", "file_path", "uploaded_by_id"],
          required: false,
        },

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
        // Responses
        {
          model: models.TransactionReportResponse,
          as: "responses",
          attributes: ["id", "user_id", "createdAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching all transaction reports:", error);
    res.status(500).json({
      error: "Failed to retrieve transaction reports",
      details: error.message,
    });
  }
};
