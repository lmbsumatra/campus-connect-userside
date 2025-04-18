const { Op } = require("sequelize");
const { models } = require("../../models");
const { GCASH } = require("../../utils/constants");
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
const getItemName = async (itemId, transactionType) => {
  // console.log(
  //   `Fetching item name for itemId: ${itemId}, transaction type: ${transactionType}`
  // );
  let item;
  if (transactionType === "sell") {
    item = await models.ItemForSale.findByPk(itemId, {
      attributes: ["item_for_sale_name"],
    });
  } else {
    item = await models.Listing.findByPk(itemId, {
      attributes: ["listing_name"],
    });
  }
  const itemName = item
    ? transactionType === "sell"
      ? item.item_for_sale_name
      : item.listing_name
    : "Unknown Item";
  // console.log(`Retrieved item name: ${itemName}`);
  return itemName;
};

const convertToCAD = async (amount) => {
  try {
    return amount * 0.025;
  } catch (error) {
    console.error("Error in convertToCAD:", error);
    return amount;
  }
};

const cancelRentalTransaction = async (req, res, emitNotification) => {
  const { id } = req.params;
  const { userId } = req.body;

  // console.log("Canceling rental transaction:???????????", { id, userId });

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

    if (!rental) {
      // console.log("Rental transaction not found:", id);
      return res.status(404).json({ error: "Rental transaction not found." });
    }

    // console.log(rental.transaction_type);

    if (
      (rental.renter_id !== userId && rental.transaction_type === "rental") ||
      (rental.transaction_type === "sell" && rental.buyer_id !== userId)
    ) {
      // console.log("Unauthorized cancellation attempt by user:", userId);
      return res
        .status(403)
        .json({ error: "Only the renter can cancel this transaction." });
    }

    if (rental.status !== "Requested") {
      // console.log("Invalid rental status for cancellation:", rental.status);
      return res
        .status(400)
        .json({ error: "Only Requested rentals can be cancelled." });
    }

    const { date_id, time_id, item_id } = rental;
    const renterName = await getUserNames(
      rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id
    );
    const itemName = await getItemName(rental.item_id, rental.transaction_type);

    // Cancel payment if applicable
    if (rental.stripe_payment_intent_id) {
      try {
        // console.log(
        //   "Attempting to cancel payment intent:",
        //   rental.stripe_payment_intent_id
        // );
        await stripe.paymentIntents.cancel(rental.stripe_payment_intent_id);
        rental.payment_status = "Cancelled";
      } catch (stripeError) {
        console.error("Error canceling payment intent:", stripeError);
        return res.status(500).json({
          error: "Failed to cancel payment intent.",
          details: stripeError.message,
        });
      }
    }

    const duration = await models.Duration.findOne({
      where: {
        date_id: date_id,
        id: time_id,
      },
    });

    if (duration) {
      await duration.update({ status: "available" });

      const anyDurationsAvailable = await models.Duration.count({
        where: {
          date_id: date_id,
          status: "available",
        },
      });

      if (anyDurationsAvailable > 0) {
        const rentalDate = await models.Date.findByPk(date_id);
        if (rentalDate) {
          await rentalDate.update({ status: "available" });
        }
      }

      const anyDatesAvailable = await models.Date.count({
        where: {
          item_id: item_id,
          status: "available",
        },
      });

      if (anyDatesAvailable > 0) {
        const item = await models.Listing.findByPk(item_id);
        if (item) {
          await item.update({ status: "approved" });
        }
      }
    } else {
      // console.log(
      //   "Rental duration not found for cancellation:",
      //   date_id,
      //   time_id
      // );
      return res.status(404).json({ error: "Rental duration not found." });
    }

    rental.status = "Cancelled";
    await rental.save();

    const notifType =
      rental.transaction_type === "sell"
        ? "purchase_cancelled"
        : "rental_cancelled";
    const action = rental.transaction_type === "sell" ? "purchase" : "rental";
    const notification = await models.StudentNotification.create({
      sender_id: userId,
      recipient_id: rental.owner_id,
      type: notifType,
      message: `${renterName} has cancelled the ${action} request for ${itemName}.`,
      is_read: false,
      rental_id: rental.id,
    });
    // console.log("Created notification for owner:", notification);

    if (emitNotification) {
      emitNotification(
        rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id,
        notification.toJSON()
      );
    }

    // After creating the notification and before sending the response
    try {
      // console.log("Sending cancellation email to owner:", rental.owner.email);
      await sendTransactionEmail({
        email: rental.owner.email,
        itemName: itemName,
        transactionType: rental.transaction_type,
        amount: rental.total_amount,
        userName: `${rental.owner.first_name} ${rental.owner.last_name}`,
        recipientType: "owner",
        status: "Cancelled", // Adding status information for the email
      });

      // console.log(
      //   "Sending cancellation email to renter:",
      //   rental.transaction_type === "sell"
      //     ? rental.buyer.email
      //     : rental.renter.email
      // );
      await sendTransactionEmail({
        email:
          rental.transaction_type === "sell"
            ? rental.buyer.email
            : rental.renter.email,
        itemName: itemName,
        transactionType: rental.transaction_type,
        amount: rental.total_amount,
        userName: renterName,
        recipientType: "renter",
        status: "Cancelled", // Adding status information for the email
      });
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
      // Continue with the response even if email fails
    }

    res.json(rental);
  } catch (error) {
    console.error("Error canceling rental transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  cancelRentalTransaction,
};
