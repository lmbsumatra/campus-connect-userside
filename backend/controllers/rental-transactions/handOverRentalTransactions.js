const { Op } = require("sequelize");
const { models } = require("../../models");
const { GCASH } = require("../../utils/constants");
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

const getItemName = async (itemId, transactionType) => {
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

const convertToCAD = async (amount) => {
  try {
    return amount * 0.025;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return amount; // Fallback to original amount if API fails
  }
};

const handOverRentalTransaction = async (req, res, emitNotification) => {
  const { id } = req.params;
  const { userId } = req.body; // userId to identify who is confirming the handover
  console.log(id, req.body);

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
          attributes: ["id", "listing_name", "description", "rate"],
        },
        { model: models.Post, attributes: ["id", "post_item_name"] },
        { model: models.Date, attributes: ["id", "date"] },
        {
          model: models.Duration,
          attributes: ["id", "rental_time_from", "rental_time_to"],
        },
      ],
    });

    if (!transaction)
      return res.status(404).json({ error: "Transaction not found." });

    const isRental = transaction.transaction_type === "rental";
    const isPurchase = transaction.transaction_type === "sell";

    // Check if the user is authorized to confirm handover
    const isOwner = transaction.owner_id === userId;
    const isRenter = isRental && transaction.renter_id === userId;
    const isBuyer = isPurchase && transaction.buyer_id === userId;

    if (!isOwner && !isRenter && !isBuyer) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    // Check if transaction status is 'Accepted'
    if (transaction.status !== "Accepted") {
      return res
        .status(400)
        .json({ error: "Only Accepted transactions can be handed over." });
    }

    const ownerName = await getUserNames(transaction.owner_id);
    const itemName = await getItemName(
      transaction.item_id,
      transaction.transaction_type
    );

    // Variables for different user roles
    let counterpartyId, counterpartyName, counterpartyRole;

    if (isRental) {
      const renterName = await getUserNames(transaction.renter_id);
      counterpartyId = isOwner ? transaction.renter_id : transaction.owner_id;
      counterpartyName = isOwner ? renterName : ownerName;
      counterpartyRole = isOwner ? "renter" : "owner";
    } else if (isPurchase) {
      const buyerName = await getUserNames(transaction.buyer_id);
      counterpartyId = isOwner ? transaction.buyer_id : transaction.owner_id;
      counterpartyName = isOwner ? buyerName : ownerName;
      counterpartyRole = isOwner ? "buyer" : "owner";
    }

    // Update the confirmation status
    if (isOwner) {
      transaction.owner_confirmed = true;
    } else if (isRenter || isBuyer) {
      transaction.renter_confirmed = true; // Use same field for both renter and buyer
    }

    // Check if both parties have confirmed
    if (transaction.owner_confirmed && transaction.renter_confirmed) {
      if (isRental) {
        transaction.status = "HandedOver";
      } else if (isPurchase) {
        transaction.status = "Returned"; // For purchases, complete the transaction
      }
      transaction.owner_confirmed = false;
      transaction.renter_confirmed = false;
    }

    // Capture payment upon handover
    try {
      if (
        transaction.stripe_payment_intent_id &&
        (transaction.owner_confirmed || transaction.renter_confirmed) &&
        transaction.transaction_type === "sell"
      ) {
        console.log(transaction.stripe_payment_intent_id);
        const paymentIntent = await stripe.paymentIntents.capture(
          transaction.stripe_payment_intent_id
        );

        const chargeId = await stripe.paymentIntents.retrieve(
          transaction.stripe_payment_intent_id
        );

        console.log({ charge: chargeId.latest_charge });
        await transaction.update({
          stripe_charge_id: chargeId.latest_charge || null,
          payment_status: "completed",
        });
      }
    } catch (stripeError) {
      console.error("Error capturing payment:", stripeError);
      return res.status(500).json({
        error: "Payment capture failed.",
        details: stripeError.message,
      });
    }

    await transaction.save();

    // Create notification with different messages for rental vs purchase
    let message;
    const currentUserName = isOwner
      ? ownerName
      : isRental
      ? await getUserNames(transaction.renter_id)
      : await getUserNames(transaction.buyer_id);

    if (isRental) {
      message = isOwner
        ? `${ownerName} has confirmed handover of ${itemName}.`
        : `${currentUserName} has confirmed receipt of ${itemName}.`;
    } else if (isPurchase) {
      message = isOwner
        ? `${ownerName} has confirmed receipt of ${itemName} for purchase.`
        : `${currentUserName} has confirmed receipt of purchased item: ${itemName}.`;
    }

    const notification = await models.StudentNotification.create({
      sender_id: userId,
      recipient_id: counterpartyId,
      type: isRental ? "handover_confirmed" : "purchase_receipt_confirmed",
      message: message,
      is_read: false,
      rental_id: transaction.id,
    });

    // Emit notification using centralized emitter
    if (emitNotification) {
      emitNotification(counterpartyId, notification.toJSON());
    }

    // Return the updated transaction
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { handOverRentalTransaction };
