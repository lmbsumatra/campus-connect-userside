const { models } = require("../../models/index");
const { Op } = require("sequelize");
const { createRentalTransaction } = require("./createRentalTransactions");
const { handOverRentalTransaction } = require("./handOverRentalTransactions");
const { cancelRentalTransaction } = require("./cancelRentalTransaction");
const { getTransactionsByUserId } = require("./getTransactionsByUserId");
const { completeRentalTransaction } = require("./completeRentalTransation");
const sendTransactionEmail = require("./sendTransactionEmail.jsx");
const { uploadEvidenceImage } = require("./uploadEvidenceImage.js");
const { declineRentalTransaction } = require("./declineRentalTransaction.js");
const { returnRentalTransaction } = require("./returnRentalTransaction.js");
const { acceptRentalTransaction } = require("./acceptRentalTransaction.js");
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

module.exports = ({ emitNotification }) => {
  // Helper function to get user names
  const getUserNames = async (userId) => {
    const user = await models.User.findByPk(userId, {
      attributes: ["first_name", "last_name"],
    });
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  // Helper function to get item name
  const getRentalItemName = async (itemId, transactionType) => {
    if (transactionType === "sell") {
      const item = await models.ItemForSale.findByPk(itemId, {
        attributes: ["item_for_sale_name"],
      });
      return item ? item.item_for_sale_name : "Unknown Item";
    } else {
      const item = await models.Listing.findByPk(itemId, {
        attributes: ["listing_name"],
      });
      return item ? item.listing_name : "Unknown Item";
    }
  };

  // Get all rental transactions
  const getAllRentalTransactions = async (req, res) => {
    try {
      const rentals = await models.RentalTransaction.findAll({
        include: [
          {
            model: models.User,
            as: "renter",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: models.User,
            as: "owner",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: models.User,
            as: "buyer",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: models.Listing,
            attributes: ["id", "listing_name", "description", "rate"],
          },
          {
            model: models.ItemForSale,
            attributes: ["id", "item_for_sale_name", "description"],
          },
          {
            model: models.Post,
            attributes: ["id", "post_item_name"],
          },
          {
            model: models.Date,
            attributes: ["id", "date"],
          },
          {
            model: models.Duration,
            attributes: ["id", "rental_time_from", "rental_time_to"],
          },
        ],
      });

      res.status(200).json(rentals);
    } catch (error) {
      //console.error("Error fetching rental transactions:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Get a specific rental transaction by ID
  const getRentalTransactionById = async (req, res) => {
    const { id } = req.params;
    try {
      const rental = await models.RentalTransaction.findByPk(id, {
        include: [
          {
            model: models.User,
            as: "owner",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: models.User,
            as: "renter",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: models.User,
            as: "buyer",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: models.Listing,
            attributes: [
              "id",
              "listing_name",
              "category",
              "rate",
              "images",
              "location",
            ],
          },
          {
            model: models.ItemForSale,
            attributes: [
              "id",
              "item_for_sale_name",
              "price",
              "category",
              "images",
              "location",
            ],
          },
          { model: models.Post, attributes: ["id", "post_item_name"] },
          { model: models.Date, attributes: ["id", "date"] },
          {
            model: models.Duration,
            attributes: ["id", "rental_time_from", "rental_time_to"],
          },
        ],
      });

      if (!rental) {
        return res.status(404).json({ error: "Rental transaction not found" });
      }

      res.json({
        success: true,
        rental,
      });
    } catch (error) {
      // console.error("Error fetching rental transaction:", error);

      res.status(500).json({
        error:
          "An unexpected error occurred while fetching the rental transaction.",
        details: error.message,
      });
    }
  };

  // Update a rental transaction
  const updateRentalTransaction = async (req, res) => {
    try {
      const rental = await models.RentalTransaction.findByPk(req.params.id);
      if (!rental)
        return res.status(404).json({ error: "Rental transaction not found" });

      await rental.update(req.body);
      res.json(rental);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // Delete a rental transaction
  const deleteRentalTransaction = async (req, res) => {
    try {
      const rental = await models.RentalTransaction.findByPk(req.params.id);
      if (!rental)
        return res.status(404).json({ error: "Rental transaction not found" });

      await rental.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return {
    updateRentalTransaction,
    deleteRentalTransaction,
    getAllRentalTransactions,
    getRentalTransactionById,
// 333333333333333333333333333333333333333333333333333333
    createRentalTransaction: (req, res) =>
      createRentalTransaction(req, res, emitNotification),
    getTransactionsByUserId: (req, res) =>
      getTransactionsByUserId(req, res, emitNotification),
    acceptRentalTransaction: (req, res) =>
      acceptRentalTransaction(req, res, emitNotification),
    handOverRentalTransaction: (req, res) =>
      handOverRentalTransaction(req, res, emitNotification),
    returnRentalTransaction: (req, res) =>
      returnRentalTransaction(req, res, emitNotification),
    completeRentalTransaction: (req, res) =>
      completeRentalTransaction(req, res, emitNotification),
    declineRentalTransaction: (req, res) =>
      declineRentalTransaction(req, res, emitNotification),
    cancelRentalTransaction: (req, res) =>
      cancelRentalTransaction(req, res, emitNotification),
    uploadEvidenceImage: (req, res) =>
      uploadEvidenceImage(req, res, emitNotification),
  };
};
