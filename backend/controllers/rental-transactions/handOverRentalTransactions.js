const { Op } = require("sequelize");
const { models } = require("../../models");
const { GCASH } = require("../../utils/constants");
const sendTransactionEmail = require("./sendTransactionEmail.jsx");
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

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
    return amount; 
  }
};

const handOverRentalTransaction = async (req, res, emitNotification) => {
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

  
    const isOwner = transaction.owner_id === userId;
    const isRenter = isRental && transaction.renter_id === userId;
    const isBuyer = isPurchase && transaction.buyer_id === userId;

    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

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

    if (isOwner) {
      transaction.owner_confirmed = true;
      transaction.renter_confirmed = true; 
    }

    if (transaction.owner_confirmed) {
      if (isRental) {
        transaction.status = "HandedOver";
      } else if (isPurchase) {
        transaction.status = "Returned"; 
      }
      transaction.owner_confirmed = false;
      transaction.renter_confirmed = false;
    }

    try {
      if (
        transaction.stripe_payment_intent_id &&
        transaction.transaction_type === "sell" &&
        transaction.payment_status !== "Completed"
      ) {
     
        const paymentIntent = await stripe.paymentIntents.capture(
          transaction.stripe_payment_intent_id
        );

        const chargeId = await stripe.paymentIntents.retrieve(
          transaction.stripe_payment_intent_id
        );

        await transaction.update({
          stripe_charge_id: chargeId.latest_charge || null,
          payment_status: "Completed",
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

    if (emitNotification) {
      emitNotification(counterpartyId, notification.toJSON());
    }

    try {
      const isCompleted =
        transaction.owner_confirmed && transaction.renter_confirmed;
      const status = isRental
        ? isCompleted
          ? "Returned"
          : "Handed Over"
        : "Completed";
      const confirmerType = isOwner ? "owner" : isRental ? "renter" : "buyer";
      const recipientEmail =
        transaction.transaction_type === "rental"
          ? isOwner
            ? transaction.renter?.email
            : transaction.owner?.email
          : isOwner
          ? transaction.buyer?.email
          : transaction.owner?.email;

      const recipientName =
        transaction.transaction_type === "rental"
          ? isOwner
            ? `${transaction.renter?.first_name} ${transaction.renter?.last_name}`
            : `${transaction.owner?.first_name} ${transaction.owner?.last_name}`
          : isOwner
          ? `${transaction.buyer?.first_name} ${transaction.buyer?.last_name}`
          : `${transaction.owner?.first_name} ${transaction.owner?.last_name}`;

      await sendTransactionEmail({
        email: recipientEmail,
        itemName: itemName,
        transactionType: isRental ? "rental" : "purchase",
        amount: transaction.amount,
        userName: recipientName,
        recipientType:
          transaction.transaction_type === "rental"
            ? isOwner
              ? "renter"
              : "owner"
            : isOwner
            ? "buyer"
            : "owner",
        status: "Handed Over",
      });
    } catch (emailError) {
      console.error("Error sending handover/receipt email:", emailError);
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { handOverRentalTransaction };
