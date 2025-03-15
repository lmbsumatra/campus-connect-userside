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

const createRentalTransaction = async (req, res, emitNotification) => {
  try {
    const {
      owner_id,
      renter_id,
      buyer_id,
      item_id,
      date_id,
      time_id,
      transaction_type,
      delivery_method,
      payment_mode,
      isFromCart,
    } = req.body;

    const missingFields = [];
    if (!owner_id) missingFields.push("owner_id");
    if (!renter_id && !buyer_id) missingFields.push("user_id");
    if (!item_id) missingFields.push("item_id");
    if (!payment_mode) missingFields.push("payment_mode");
    if (!date_id) missingFields.push("date_id");
    if (!time_id) missingFields.push("time_id");

    if (missingFields.length > 0) {
      const errorMsg =
        "The following fields are required: " + missingFields.join(", ");
      console.error(errorMsg);
      return res.status(400).json({ error: errorMsg });
    }

    // Check if owner_id is the same as renter_id
    if (owner_id === renter_id) {
      const errorMsg = "The owner cannot rent the item to themselves.";
      console.error(errorMsg);
      return res.status(400).json({ error: errorMsg });
    }

    // Create the rental transaction
    const rentalData = {
      owner_id,
      renter_id,
      buyer_id,
      item_id,
      delivery_method,
      payment_mode,
      date_id,
      time_id,
      transaction_type: transaction_type === "sell" ? "sell" : "rental", // Added this line to properly handle the transaction_type
    };

    if (isFromCart) {
      // Add any cart-specific data or flags needed
      rentalData.from_cart = true;

      // You might also want to remove the item from the cart after successful rental creation
      // This would depend on your specific cart implementation
      try {
        await models.Cart.destroy({
          where: {
            user_id: transaction_type === "sell" ? buyer_id : renter_id,
            item_id: item_id,
            date: date_id,
            duration: time_id,
          },
        });
      } catch (cartError) {
        console.error("Error removing item from cart:", cartError);
        // Decide if you want to continue with rental creation even if cart removal fails
      }
    }

    let rental = await models.RentalTransaction.create(rentalData);

    rental = await models.RentalTransaction.findOne({
      where: { id: rental.id },
      include: [
        {
          as: "renter",
          model: models.User,
          attributes: ["user_id", "email", "stripe_acct_id"],
        },
        {
          as: "buyer",
          model: models.User,
          attributes: ["user_id", "email", "stripe_acct_id"],
        },
      ],
    });

    let item;
    // Add condition to handle both rental and sell transactions
    if (transaction_type === "rental") {
      item = await models.Listing.findOne({
        where: { id: rental.item_id },
        attributes: ["id", "listing_name", "rate", "security_deposit"],
        include: [
          {
            as: "owner",
            model: models.User,
            attributes: ["user_id", "email", "stripe_acct_id"],
          },
        ],
      });
    } else if (transaction_type === "sell") {
      item = await models.ItemForSale.findOne({
        where: { id: rental.item_id },
        attributes: ["id", "item_for_sale_name", "price"],
        include: [
          {
            as: "seller",
            model: models.User,
            attributes: ["user_id", "email", "stripe_acct_id"],
          },
        ],
      });
    }

    const totalAmountPHP =
      transaction_type === "sell"
        ? Number(item?.price)
        : Number(item?.rate) + Number(item?.security_deposit);
    const totalAmountCAD = await convertToCAD(totalAmountPHP);
    const applicationFeeAmount = totalAmountCAD * 0.1;

    let result = { id: rental.id };

    // Handle payment based on payment mode
    if (payment_mode === GCASH) {
      try {
        // Create a PaymentIntent with capture_method: 'manual' for authorize-only
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmountCAD * 100), // Convert to cents
          currency: "cad",
          automatic_payment_methods: {
            enabled: true,
          },
          payment_method_options: {
            card: {
              capture_method: "manual",
            },
          },
          capture_method: "manual", // Authorize only, capture later
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "always",
          },
          metadata: {
            transactionId: rental.id,
            itemId: item_id,
            userId:
              transaction_type === "rental" ? rental.renter_id : rental.buyer_id,
            email:
              transaction_type === "rental"
                ? rental.renter.email
                : rental.buyer.email,
          },
          transfer_data: {
            destination:
              transaction_type === "rental"
                ? item.owner.stripe_acct_id
                : item.seller.stripe_acct_id,
          },
          application_fee_amount: Math.floor(applicationFeeAmount * 100),
        });

        // Update rental with payment intent ID
        await rental.update({ stripe_payment_intent_id: paymentIntent.id });

        // Return the client secret to the frontend
        result = {
          id: rental.id,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      } catch (stripeError) {
        console.error("Error creating Stripe PaymentIntent:", stripeError);
        return res.status(500).json({
          error: "Stripe payment setup failed.",
          details: stripeError.message,
        });
      }
    }

    // Add Notification Logic Here
    const renterName = await getUserNames(
      transaction_type === "sell" ? buyer_id : renter_id
    );
    const itemName = await getRentalItemName(item_id);

    // Create notification
    const notification = await models.StudentNotification.create({
      sender_id: transaction_type === "sell" ? buyer_id : renter_id,
      recipient_id: owner_id,
      type: "rental_request",
      message: `${renterName} wants to rent ${itemName}.`,
      is_read: false,
      rental_id: rental.id,
    });

    // Emit notification using centralized emitter
    if (emitNotification) {
      emitNotification(owner_id, notification.toJSON());
    }

    // After creating the rental transaction, update the duration's status to 'requested'
    const duration = await models.Duration.findOne({
      where: {
        date_id: date_id,
        id: time_id,
      },
    });

    if (duration) {
      // Set the status to 'requested'
      await duration.update({ status: "requested" });

      // Check if all durations for this date are rented
      const allDurationsRented = await models.Duration.count({
        where: {
          date_id: date_id,
          status: { [Op.ne]: "available" }, // Check for rented or requested
        },
      });

      const totalDurationsForDate = await models.Duration.count({
        where: {
          date_id: date_id,
        },
      });

      if (allDurationsRented === totalDurationsForDate) {
        // Update the date status to 'rented'
        const rentalDate = await models.Date.findByPk(date_id);
        if (rentalDate) {
          await rentalDate.update({ status: "rented" });
        } else {
          console.error("Rental date not found for id:", date_id);
        }
      }

      // Check if all dates for the item are rented
      const allDatesRented = await models.Date.count({
        where: {
          item_id: item_id,
          status: "rented",
        },
      });

      const totalDatesForItem = await models.Date.count({
        where: {
          item_id: item_id,
        },
      });

      if (allDatesRented === totalDatesForItem) {
        // Update the item status to 'unavailable'
        const item = await models.Listing.findByPk(item_id);
        if (item) {
          await item.update({ status: "unavailable" });
        } else {
          console.error("Item not found for id:", item_id);
        }
      }
    } else {
      const errorMsg = "The specified rental duration was not found.";
      console.error(errorMsg);
      return res.status(404).json({ error: errorMsg });
    }

    // Respond with the created rental transaction and payment information
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error creating rental transaction:", error);

    // Detailed error handling
    let errorMessage =
      "An error occurred while creating the rental transaction. Please try again.";
    if (error.name === "SequelizeValidationError") {
      errorMessage =
        "Validation error: " +
        error.errors.map((err) => err.message).join(", ");
    } else if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage =
        "Unique constraint error: " +
        error.errors.map((err) => err.message).join(", ");
    } else if (error.original) {
      errorMessage = error.original.sqlMessage || error.message;
    }

    console.error("Detailed error:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      details: error.message,
    });
  }
};

module.exports = {
  createRentalTransaction,
};
