const { Op } = require("sequelize");
const { models } = require("../../models/index.js");
const { GCASH } = require("../../utils/constants.js");
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

const returnRentalTransaction = async (req, res,emitNotification) => {
  // console.log("returnRentalTransaction called");
  const { id } = req.params;
  const { userId } = req.body;

  // console.log("Request Params:", id);
  // console.log("Request Body:", userId);

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

    // console.log("Rental fetched:", rental);

    if (!rental) {
      // console.log("Rental transaction not found");
      return res.status(404).json({ error: "Rental transaction not found." });
    }

    // console.log("Rental status:", rental.status);

    const isOwner = rental.owner_id === userId;
    const isRenter = rental.renter_id === userId;

    // console.log("Is Owner:", isOwner, "Is Renter:", isRenter);

    if (!isOwner && !isRenter) {
      // console.log("Unauthorized action");
      return res.status(403).json({ error: "Unauthorized action." });
    }

    if (rental.status !== "HandedOver") {
      // console.log("Rental status is not 'HandedOver'");
      return res
        .status(400)
        .json({ error: "Only handed over rentals can be returned." });
    }

    // console.log("Fetching user names...");
    const ownerName = await getUserNames(rental.owner_id);
    const renterName = await getUserNames(rental.renter_id);
    const itemName = await getRentalItemName(rental.item_id);

    // console.log(
    //   "Owner Name:",
    //   ownerName,
    //   "Renter Name:",
    //   renterName,
    //   "Item Name:",
    //   itemName
    // );

    if (isOwner) {
      rental.owner_confirmed = true;
    } else if (isRenter) {
      rental.renter_confirmed = true;
    }

    // console.log(
    //   "Owner Confirmed:",
    //   rental.owner_confirmed,
    //   "Renter Confirmed:",
    //   rental.renter_confirmed
    // );

    if (rental.owner_confirmed || rental.renter_confirmed) {
      rental.status = "Returned";
      rental.owner_confirmed = false;
      rental.renter_confirmed = false;

      try {
        const recipientEmail = isOwner
          ? rental.renter.email
          : rental.owner.email;
        const recipientName = isOwner
          ? `${rental.renter.first_name} ${rental.renter.last_name}`
          : `${rental.owner.first_name} ${rental.owner.last_name}`;

        await sendTransactionEmail({
          email: recipientEmail,
          itemName,
          transactionType: "rental",
          amount: rental.total_amount,
          userName: recipientName,
          recipientType: isOwner ? "renter" : "owner",
          status: "Returned",
        });
      } catch (emailError) {
        console.error("Error sending return confirmation email:", emailError);
      }
    }

    try {
      // console.log("Checking for payment capture conditions...");
      if (
        rental.stripe_payment_intent_id &&
        rental.payment_status !== "completed" &&
        (rental.owner_confirmed || rental.renter_confirmed) &&
        rental.transaction_type === "rental"
      ) {
        // console.log(
        //   "Capturing payment for intent:",
        //   rental.stripe_payment_intent_id
        // );

        const paymentIntent = await stripe.paymentIntents.capture(
          rental.stripe_payment_intent_id
        );
        // console.log("Payment intent captured:", paymentIntent);

        const chargeId = await stripe.paymentIntents.retrieve(
          rental.stripe_payment_intent_id
        );
        // console.log("Charge ID retrieved:", chargeId.latest_charge);

        await rental.update({
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

    await rental.save();
    // console.log("Rental saved:", rental);

    let recipientId;
    let message;

    if (isOwner) {
      recipientId = rental.renter_id;
      message = `${ownerName} has confirmed receiving ${itemName}. Confirm complete transaction.`;
    } else if (isRenter) {
      recipientId = rental.owner_id;
      message = `${renterName} has confirmed return of ${itemName}. Confirm receipt and complete transaction.`;
    }

    // console.log("Notification recipient:", recipientId, "Message:", message);

    const notification = await models.StudentNotification.create({
      sender_id: userId,
      recipient_id: recipientId,
      type: "return_confirmed",
      message: message,
      is_read: false,
      rental_id: rental.id,
    });

    // console.log("Notification created:", notification);

    if (emitNotification) {
      // console.log("Emitting notification...");
      emitNotification(recipientId, notification.toJSON());
    }

    // console.log("Returning response...");
    res.json(rental);
  } catch (error) {
    console.error("Error in returnRentalTransaction:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { returnRentalTransaction };
