const { Op } = require("sequelize");
const { models } = require("../../models");
const { GCASH } = require("../../utils/constants"); // Make sure STRIPE is added to constants
const sendTransactionEmail = require("./sendTransactionEmail.jsx");
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
    // console.error("Error fetching exchange rate:", error);
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

    if (!transaction)
      return res.status(404).json({ error: "Transaction not found." });

    const isRental = transaction.transaction_type === "rental";
    const isPurchase = transaction.transaction_type === "sell";
    const isOwner = transaction.owner_id === userId;
    const isRenter = isRental && transaction.renter_id === userId;
    const isBuyer = isPurchase && transaction.buyer_id === userId;

    if (!isOwner && !isRenter && !isBuyer) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    if (isRental && transaction.status !== "Returned") {
      return res
        .status(400)
        .json({ error: "Only returned rentals can be completed." });
    }

    if (isPurchase && transaction.status !== "Handed Over") {
      return res
        .status(400)
        .json({ error: "Only handed over purchases can be completed." });
    }

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

    if (isOwner) transaction.owner_confirmed = true;
    if (isRenter) transaction.renter_confirmed = true;
    if (isBuyer) transaction.buyer_confirmed = true; // Added this flag for purchases

    if (
      transaction.owner_confirmed &&
      (transaction.renter_confirmed || transaction.buyer_confirmed)
    ) {
      transaction.status = "Completed";
      transaction.owner_confirmed = false;
      transaction.renter_confirmed = false;
      transaction.buyer_confirmed = false; // Reset the buyer confirmation flag

      if (isRental && transaction.Duration) {
        await models.Duration.update(
          { status: "available" },
          { where: { id: transaction.Duration.id } }
        );

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
      } else if (isPurchase && transaction.Listing) {
        await models.Listing.update(
          { status: "sold" },
          { where: { id: transaction.Listing.id } }
        );
      }

      const itemName =
        transaction.Listing?.listing_name ||
        transaction.Post?.post_item_name ||
        "item";
      const userName = isOwner
        ? ownerName
        : isRental
        ? counterpartyName
        : counterpartyName;
      const recipientEmail = isOwner
        ? transaction.owner.email
        : isRental
        ? transaction.renter.email
        : transaction.buyer.email;

      await sendTransactionEmail({
        email: recipientEmail,
        itemName,
        transactionType: transaction.transaction_type,
        amount: transaction.total_amount,
        userName,
        status: "Completed",
      });

      const notifications = [
        {
          recipientId: transaction.owner_id,
          message: isRental
            ? `Rental transaction with ${counterpartyName} has been completed.`
            : `Sale of ${itemName} to ${counterpartyName} has been completed.`,
        },
        {
          recipientId: isRental ? transaction.renter_id : transaction.buyer_id,
          message: isRental
            ? `Rental transaction with ${ownerName} has been completed.`
            : `Purchase of ${itemName} from ${ownerName} has been completed.`,
        },
      ].map(async ({ recipientId, message }) => {
        const notification = await models.StudentNotification.create({
          sender_id: userId,
          recipient_id: recipientId,
          type: isRental ? "rental_completed" : "purchase_completed",
          message,
          is_read: false,
          rental_id: transaction.id,
        });

        if (emitNotification)
          emitNotification(recipientId, notification.toJSON());
        return notification;
      });

      await Promise.all(notifications);
    }

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error completing transaction.", details: error.message });
  }
};

module.exports = { completeRentalTransaction };
