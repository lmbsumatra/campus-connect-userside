const { Op } = require("sequelize");
const { models } = require("../../models");
const { GCASH } = require("../../utils/constants"); // Make sure STRIPE is added to constants
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

// Helper function to get user names
const getUserNames = async (userId) => {
  const user = await models.User.findByPk(userId, {
    attributes: ["first_name", "last_name"],
  });
  return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
};

const getRentalItemName = async (itemId) => {
  const item = await models.Listing.findByPk(itemId, {
    attributes: ["listing_name"],
  });
  return item ? item.listing_name : "Unknown Item";
};

const convertToCAD = async (amount) => {
  try {
    return amount * 0.025;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return amount; // Fallback to original amount if API fails
  }
};

const completeRentalTransaction = async (req, res, emitNotification) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const transaction = await models.RentalTransaction.findByPk(id, {
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
          attributes: ["id", "listing_name", "description", "rate", "status"],
        },
        {
          model: models.Post,
          attributes: ["id", "post_item_name", "status"],
        },
        {
          model: models.Date,
          attributes: ["id", "date", "status"],
        },
        {
          model: models.Duration,
          attributes: ["id", "rental_time_from", "rental_time_to", "status"],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // console.log(transaction);
    const isRental = transaction.transaction_type === "rental";
    const isPurchase = transaction.transaction_type === "sell";

    // Check if the user is authorized
    const isOwner = transaction.owner_id === userId;
    const isRenter = isRental && transaction.renter_id === userId;
    const isBuyer = isPurchase && transaction.buyer_id === userId;

    if (!isOwner && !isRenter && !isBuyer) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    // Check appropriate status for completion based on transaction type
    if (isRental && transaction.status !== "Returned") {
      return res.status(400).json({
        error: "Only returned rentals can be completed.",
        currentStatus: transaction.status,
      });
    }

    if (isPurchase && transaction.status !== "Returned") {
      return res.status(400).json({
        error: "Only handed over purchases can be completed.",
        currentStatus: transaction.status,
      });
    }

    // Get user names
    const ownerName = await getUserNames(transaction.owner_id);
    let counterpartyName, counterpartyId;

    if (isRental) {
      const renterName = await getUserNames(transaction.renter_id);
      counterpartyName = isOwner ? renterName : ownerName;
      counterpartyId = isOwner ? transaction.renter_id : transaction.owner_id;
    } else if (isPurchase) {
      const buyerName = await getUserNames(transaction.buyer_id);
      counterpartyName = isOwner ? buyerName : ownerName;
      counterpartyId = isOwner ? transaction.buyer_id : transaction.owner_id;
    }

    // Update the confirmation status
    if (isOwner) {
      transaction.owner_confirmed = true;
    } else if (isRenter || isBuyer) {
      transaction.renter_confirmed = true; // Reuse field for both renter and buyer
    }

    // Check if both parties have confirmed
    if (transaction.owner_confirmed && transaction.renter_confirmed) {
      // Update the transaction status to completed
      transaction.status = "Completed";

      // Reset confirmations
      transaction.owner_confirmed = false;
      transaction.renter_confirmed = false;

      // For rentals, update resource availability
      if (isRental) {
        // Update the availability of the duration
        if (transaction.Duration) {
          await models.Duration.update(
            { status: "available" },
            { where: { id: transaction.Duration.id } }
          );
        }

        // Update the date status if all durations are available
        if (transaction.Date) {
          const allDurationsAvailable = await models.Duration.findAll({
            where: {
              date_id: transaction.Date.id,
              status: { [Op.ne]: "available" },
            },
          });

          if (allDurationsAvailable.length === 0) {
            await models.Date.update(
              { status: "available" },
              { where: { id: transaction.Date.id } }
            );
          }
        }

        // Update the listing status if all dates are available
        if (transaction.Listing) {
          const allDatesUnavailable = await models.Date.findAll({
            where: {
              item_id: transaction.Listing.id,
              status: { [Op.ne]: "available" },
            },
          });

          if (allDatesUnavailable.length === 0) {
            await models.Listing.update(
              { status: "approved" },
              { where: { id: transaction.Listing.id } }
            );
          }
        }
      } else if (isPurchase) {
        // For purchases, update the listing status to sold
        if (transaction.Listing) {
          await models.Listing.update(
            { status: "sold" },
            { where: { id: transaction.Listing.id } }
          );
        }
      }

      // Get the item name
      const itemName = transaction.Listing
        ? transaction.Listing.listing_name
        : transaction.Post
        ? transaction.Post.post_item_name
        : "item";

      // Get user names
      const ownerName = await getUserNames(transaction.owner_id);
      let buyerName = "";
      if (isPurchase) {
        buyerName = await getUserNames(transaction.buyer_id);
      }
      let renterName = "";
      if (isRental) {
        renterName = await getUserNames(transaction.renter_id);
      }

      // Create notifications for both parties
      const notificationPromises = [
        {
          recipientId: transaction.owner_id,
          message: isRental
            ? `Rental transaction with ${renterName} has been completed successfully.`
            : `Sale of ${itemName} to ${buyerName} has been completed successfully.`,
        },
        {
          recipientId: isRental ? transaction.renter_id : transaction.buyer_id,
          message: isRental
            ? `Rental transaction with ${ownerName} has been completed successfully.`
            : `Purchase of ${itemName} from ${ownerName} has been completed successfully.`,
        },
      ].map(async ({ recipientId, message }) => {
        const notification = await models.StudentNotification.create({
          sender_id: userId,
          recipient_id: recipientId,
          type: isRental ? "rental_completed" : "purchase_completed",
          message: message,
          is_read: false,
          rental_id: transaction.id,
        });

        // Emit notification using centralized emitter
        if (emitNotification) {
          emitNotification(recipientId, notification.toJSON());
        }

        return notification;
      });
      await Promise.all(notificationPromises);
    }

    // Save all changes to the transaction
    await transaction.save();

    // Return the updated transaction data
    res.json(transaction);
  } catch (error) {
    console.error("Error completing transaction:", error);
    return res.status(500).json({
      error: "An error occurred while completing the transaction.",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = { completeRentalTransaction };
