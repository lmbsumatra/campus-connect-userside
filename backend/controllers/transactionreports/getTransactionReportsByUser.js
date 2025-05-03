const { Op } = require("sequelize");
const { models } = require("../../models");

module.exports = () => async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requestingUserId = req.user?.userId;

    // Security check: Users can only view their own reports
    if (userId !== requestingUserId) {
      return res.status(403).json({
        error: "Forbidden: You can only view your own transaction reports",
      });
    }

    const reports = await models.TransactionReport.findAll({
      where: {
        [Op.or]: [
          { reporter_id: userId }, // Reports created by this user
          { reported_id: userId }, // Reports about this user
        ],
      },
      include: [
        // Reporter User + Student Profile Pic
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
        // Reported User + Student Profile Pic
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
        // Add any other necessary includes
        {
          model: models.RentalTransaction,
          as: "rentalTransaction",
          attributes: ["id", "item_id", "transaction_type"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching user transaction reports:", error);
    res.status(500).json({
      error: "Failed to retrieve transaction reports",
      details: error.message,
    });
  }
};
