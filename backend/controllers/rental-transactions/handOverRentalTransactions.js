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

const handOverRentalTransaction = async (req, res, emitNotification) => {
  const { id } = req.params;
  const { userId } = req.body; // userId to identify who is confirming the handover

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

    if (!rental)
      return res.status(404).json({ error: "Rental transaction not found." });

    // Check if the user is the owner or renter
    const isOwner = rental.owner_id === userId;
    const isRenter = rental.renter_id === userId;

    if (!isOwner && !isRenter) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    // Check if rental status is 'Accepted'
    if (rental.status !== "Accepted") {
      return res
        .status(400)
        .json({ error: "Only Accepted rentals can be handed over." });
    }

    const ownerName = await getUserNames(rental.owner_id);
    const renterName = await getUserNames(rental.renter_id);
    const itemName = await getRentalItemName(rental.item_id);

    // Update the confirmation status
    if (isOwner) {
      rental.owner_confirmed = true;
    } else if (isRenter) {
      rental.renter_confirmed = true;
    }

    // Check if both parties have confirmed
    if (rental.owner_confirmed && rental.renter_confirmed) {
      rental.status = "HandedOver";
      rental.owner_confirmed = false;
      rental.renter_confirmed = false;
    }

    // Capture payment upon handover
    try {
      if (rental.stripe_payment_intent_id && rental.owner_confirmed) {
        console.log(rental.stripe_payment_intent_id);
        const paymentIntent = await stripe.paymentIntents.capture(
          rental.stripe_payment_intent_id
        );

        const chargeId = await stripe.paymentIntents.retrieve(
          rental.stripe_payment_intent_id
        );

        console.log({ charge: chargeId.latest_charge });
        await rental.update({
          charge_id: chargeId.latest_charge || null,
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

    // Capture the payment when the handover is confirmed
    try {
      if (rental.stripe_payment_intent_id) {
        const paymentIntent = await stripe.paymentIntents.capture(
          rental.stripe_payment_intent_id
        );

        console.log("Payment captured successfully for rental:", rental.id);

        // Save the charge_id in the database
        const chargeId = paymentIntent.charges.data[0]?.id || null;
        await rental.update({ charge_id: chargeId });
      }
    } catch (stripeError) {
      console.error("Error capturing payment:", stripeError);
      return res.status(500).json({
        error: "Payment capture failed.",
        details: stripeError.message,
      });
    }

    let recipientId;
    let message;

    if (isOwner) {
      recipientId = rental.renter_id;
      message = `${ownerName} has confirmed handover of ${itemName}.`;
    } else if (isRenter) {
      recipientId = rental.owner_id;
      message = `${renterName} has confirmed receipt of ${itemName}.`;
    }

    const notification = await models.StudentNotification.create({
      sender_id: userId,
      recipient_id: recipientId,
      type: "handover_confirmed",
      message: message,
      is_read: false,
      rental_id: rental.id,
    });

    // Emit notification using centralized emitter
    if (emitNotification) {
      emitNotification(recipientId, notification.toJSON());
    }
    // Return the updated rental transaction
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { handOverRentalTransaction };
