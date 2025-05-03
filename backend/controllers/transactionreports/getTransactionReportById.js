const { Op } = require("sequelize");
const { models } = require("../../models");

module.exports = () => async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user?.userId;
    const adminId = req.adminUser?.adminId;

    const report = await models.TransactionReport.findByPk(reportId, {
      include: [
        // Reporter User + Profile
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
        // Reported User + Profile
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
        // Admin Resolver + Profile
        {
          model: models.User,
          as: "resolvedByAdmin",
          attributes: ["user_id", "first_name", "last_name"],
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["profile_pic"],
              required: false,
            },
          ],
          required: false,
        },

        {
          model: models.TransactionEvidence,
          as: "evidence",
          where: { transaction_report_response_id: null },
          required: false,
        },
        // Responses
        {
          model: models.TransactionReportResponse,
          as: "responses",
          required: false,
          include: [
            {
              model: models.User,
              as: "user",
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
              model: models.TransactionEvidence,
              as: "evidence",
              required: false,
            },
          ],
        },
        // Rental Transaction
        {
          model: models.RentalTransaction,
          as: "rentalTransaction",
          required: false,
          include: [
            {
              model: models.Listing,
              attributes: ["id", "listing_name", "owner_id"],
              required: false,
            },
            {
              model: models.ItemForSale,
              attributes: ["id", "item_for_sale_name", "seller_id"],
              required: false,
            },
          ],
        },
      ],
      order: [
        // Ensure responses are ordered chronologically
        [
          { model: models.TransactionReportResponse, as: "responses" },
          "createdAt",
          "ASC",
        ],
      ],
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Access Control (Admin OR Involved Student)
    const isReporter = userId === report.reporter_id;
    const isReported = userId === report.reported_id;
    const isAdmin = !!adminId;

    if (!isAdmin && !isReporter && !isReported) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to view this report.",
      });
    }
    return res.status(200).json(report);
  } catch (error) {
    console.error("Error in getTransactionReportById:", error);
    res.status(500).json({
      error: "Failed to retrieve report details",
      details: error.message,
    });
  }
};
