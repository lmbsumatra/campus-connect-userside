const { Op } = require("sequelize");
const { models } = require("../../models/index.js");
const { GCASH } = require("../../utils/constants.js");
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
    const convertedAmount = amount * 0.025;
    return convertedAmount;
  } catch (error) {
    console.error("Error converting to CAD:", error);
    return amount;
  }
};

const returnRentalTransaction = async (req, res, emitNotification) => {
  const { id } = req.params;
  const { userId } = req.body;

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

    if (!rental) {
      return res.status(404).json({ error: "Rental transaction not found." });
    }

    const isOwner = rental.owner_id === userId;
    const isRenter = rental.renter_id === userId;

    if (!isOwner && !isRenter) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    if (rental.status !== "HandedOver") {
      return res
        .status(400)
        .json({ error: "Only handed over rentals can be returned." });
    }

    const ownerName = await getUserNames(rental.owner_id);
    const renterName = await getUserNames(rental.renter_id);
    const itemName = await getItemName(rental.item_id, rental.transaction_type);

    if (isOwner) {
      rental.owner_confirmed = true;
    } else if (isRenter) {
      rental.renter_confirmed = true;
    }

    if (rental.owner_confirmed) {
      rental.status = "Returned";
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
          amount: rental.amount,
          userName: recipientName,
          recipientType: isOwner ? "renter" : "owner",
          status: "Returned",
        });
      } catch (emailError) {
        console.error("Error sending return confirmation email:", emailError);
      }
    }

    if (rental.owner_confirmed) {
      if (
        rental.stripe_payment_intent_id &&
        rental.payment_status !== "Completed" &&
        rental.transaction_type === "rental"
      ) {
        try {
          const paymentIntent = await stripe.paymentIntents.capture(
            rental.stripe_payment_intent_id
          );

          const chargeId = await stripe.paymentIntents.retrieve(
            rental.stripe_payment_intent_id
          );

          await rental.update({
            stripe_charge_id: chargeId.latest_charge || null,
            payment_status: "Completed",
          });
        } catch (stripeError) {
          console.error("Error capturing payment:", stripeError);
          return res.status(500).json({
            error: "Payment capture failed.",
            details: stripeError.message,
          });
        }
      }

      try {
        const intent = await stripe.paymentIntents.retrieve(
          rental.stripe_payment_intent_id
        );

        const depositAmount = parseFloat(intent.metadata?.deposit || "0");

        if (depositAmount > 0) {
          const cadDeposit = await convertToCAD(depositAmount);
          const refund = await stripe.refunds.create({
            payment_intent: rental.stripe_payment_intent_id,
            amount: Math.round(cadDeposit * 100), // cents
            reason: "requested_by_customer",
          });
        }
      } catch (refundError) {
        console.error("Error refunding security deposit:", refundError.message);
      }

      rental.status = "Returned";
      rental.owner_confirmed = false;
      rental.renter_confirmed = false;
    }

    await rental.save();

    let recipientId;
    let message;

    if (isOwner) {
      recipientId = rental.renter_id;
      message = `${ownerName} has confirmed receiving ${itemName}. Confirm complete transaction.`;
    } else if (isRenter) {
      recipientId = rental.owner_id;
      message = `${renterName} has confirmed return of ${itemName}. Confirm receipt and complete transaction.`;
    }

    const notification = await models.StudentNotification.create({
      sender_id: userId,
      recipient_id: recipientId,
      type: "return_confirmed",
      message: message,
      is_read: false,
      rental_id: rental.id,
    });

    if (emitNotification) {
      emitNotification(recipientId, notification.toJSON());
    }

    res.json(rental);
  } catch (error) {
    console.error("Error in returnRentalTransaction:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { returnRentalTransaction };
