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
  const userName = user
    ? `${user.first_name} ${user.last_name}`
    : "Unknown User";
  return userName;
};

const getItemName = async (itemId, transactionType, isFromPost = false) => {
  let item;
  if (isFromPost) {
    item = await models.Post.findByPk(itemId, {
      attributes: ["post_item_name"],
    });
    return item ? item.post_item_name : "Unknown Item";
  } else if (transactionType === "sell") {
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
  return itemName;
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

const getNotificationDetails = (transactionType) => {
  const details = {
    type: transactionType === "sell" ? "purchase_request" : "rental_request",
    action: transactionType === "sell" ? "buy" : "rent",
  };
  return details;
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
      amount,
      quantity,
      from_post,
      item_security_deposit,
    } = req.body;

    console.log(req.body);

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

    if (owner_id === renter_id) {
      const errorMsg = "The owner cannot rent the item to themselves.";
      console.error(errorMsg);
      return res.status(400).json({ error: errorMsg });
    }

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const existingTransaction = await models.RentalTransaction.findOne({
      where: {
        item_id,
        [transaction_type === "sell" ? "buyer_id" : "renter_id"]:
          transaction_type === "sell" ? buyer_id : renter_id,
        transaction_type: transaction_type === "sell" ? "sell" : "rental",
        status: {
          [Op.notIn]: ["cancelled", "declined", "completed"],
        },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // if (existingTransaction) {
    //   const errorMsg = "A transaction already exists.";
    //   console.error(errorMsg);
    //   return res.status(409).json({ message: errorMsg });
    // }

    const rentalData = {
      owner_id,
      renter_id,
      buyer_id,
      [from_post ? "post_id" : "item_id"]: item_id,
      delivery_method,
      payment_mode,
      date_id,
      time_id,
      transaction_type: transaction_type === "sell" ? "sell" : "rental",
      quantity,
      amount: Number(amount),
    };

    console.log(rentalData.amount);

    const dateInfo = await models.Date.findByPk(date_id, {
      attributes: ["date"],
    });

    const timeInfo = await models.Duration.findByPk(time_id, {
      attributes: ["rental_time_from", "rental_time_to"],
    });

    if (!dateInfo || !timeInfo) {
      const errorMsg = "Could not find date or time information";
      console.error(errorMsg);
      return res.status(404).json({ error: errorMsg });
    }

    rentalData.tnx_date = dateInfo.date;
    rentalData.tnx_time_from = timeInfo.rental_time_from;
    rentalData.tnx_time_to = timeInfo.rental_time_to;

    if (isFromCart) {
      rentalData.from_cart = true;

      try {
        const destroyResult = await models.Cart.destroy({
          where: {
            user_id: transaction_type === "sell" ? buyer_id : renter_id,
            item_id: item_id,
            date: date_id,
            duration: time_id,
          },
        });
      } catch (cartError) {
        console.error("Error removing item from cart:", cartError);
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
          as: "owner",
          model: models.User,
          attributes: [
            "user_id",
            "email",
            "stripe_acct_id",
            "first_name",
            "last_name",
          ],
        },
        {
          as: "buyer",
          model: models.User,
          attributes: ["user_id", "email", "stripe_acct_id"],
        },
      ],
    });

    let item;

    // if (from_post) true skip getting item
    if (!from_post) {
      if (transaction_type === "rental") {
        item = await models.Listing.findOne({
          where: { id: rental.item_id },
          attributes: ["id", "listing_name", "rate", "security_deposit"],
          include: [
            {
              as: "owner",
              model: models.User,
              attributes: ["user_id", "email", "stripe_acct_id", "first_name"],
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
              attributes: ["user_id", "email", "stripe_acct_id", "first_name"],
            },
          ],
        });
      }
    } else {
      if (transaction_type === "rental") {
        item = await models.Post.findOne({
          where: { id: rental.post_id },
          attributes: ["id", "post_item_name"],
          include: [
            {
              as: "renter",
              model: models.User,
              attributes: ["user_id", "email", "stripe_acct_id", "first_name"],
            },
          ],
        });
      } else if (transaction_type === "sell") {
        item = await models.Post.findOne({
          where: { id: rental.post_id },
          attributes: ["id", "post_item_name"],
          include: [
            {
              as: "buyer",
              model: models.User,
              attributes: ["user_id", "email", "stripe_acct_id", "first_name"],
            },
          ],
        });
      }
    }

    const totalAmountPHP =
      transaction_type === "sell"
        ? Number(amount)
        : Number(amount) +
          Number(
            item?.security_deposit || (from_post ? item_security_deposit : 0)
          );


    rental.amount = totalAmountPHP;
    rental.quantity = quantity;
    await rental.save();

    const totalAmountCAD = await convertToCAD(totalAmountPHP);

    const applicationFeeAmount = totalAmountCAD * 0.1;

    let result = { id: rental.id };

    if (payment_mode === GCASH) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmountCAD * 100),
          currency: "cad",
          automatic_payment_methods: {
            enabled: true,
          },
          payment_method_options: {
            card: {
              capture_method: "manual",
            },
          },
          capture_method: "manual",
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "always",
          },
          metadata: {
            deposit: item?.security_deposit,
            transactionId: rental.id,
            itemId: item_id,
            userId:
              transaction_type === "rental"
                ? rental.renter_id
                : rental.buyer_id,
            email:
              transaction_type === "rental"
                ? rental.renter.email
                : rental.buyer.email,
          },
          transfer_data: {
            destination: from_post
              ? transaction_type === "rental"
                ? rental.owner.stripe_acct_id
                : rental.seller.stripe_acct_id
              : transaction_type === "rental"
              ? item.owner.stripe_acct_id
              : item.seller.stripe_acct_id,
          },

          application_fee_amount: Math.floor(applicationFeeAmount * 100),
        });

        await rental.update({ stripe_payment_intent_id: paymentIntent.id });

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

    const renterName = await getUserNames(
      transaction_type === "sell" ? buyer_id : renter_id
    );
    const itemName = await getItemName(item_id, transaction_type, from_post);

    const { type: notificationType, action } =
      getNotificationDetails(transaction_type);
    const message = `${renterName} wants to ${action} ${itemName}.`;

    const notification = await models.StudentNotification.create({
      sender_id: transaction_type === "sell" ? buyer_id : renter_id,
      recipient_id: owner_id,
      type: notificationType,
      message: message,
      is_read: false,
      rental_id: rental.id,
    });

    if (emitNotification) {
      emitNotification(owner_id, notification.toJSON());
    }

    const ownerEmail = from_post
      ? rental.owner?.email
      : transaction_type === "sell"
      ? item.seller?.email
      : item.owner?.email;

    const ownerName = from_post
      ? rental.owner?.first_name
      : transaction_type === "sell"
      ? item.seller?.first_name
      : item.owner?.first_name;

    await sendTransactionEmail({
      email: ownerEmail,
      itemName,
      transactionType: transaction_type,
      amount: totalAmountPHP,
      userName: ownerName,
      recipientType: "owner",
      status: "Requested",
    });

    await sendTransactionEmail({
      email:
        transaction_type === "sell" ? rental.buyer.email : rental.renter.email,
      itemName,
      transactionType: transaction_type,
      amount: totalAmountPHP,
      userName: renterName,
      recipientType: "buyerOrRenter",
      status: "Requested",
    });

    const duration = await models.Duration.findOne({
      where: {
        date_id: date_id,
        id: time_id,
      },
    });

    if (transaction_type === "rental") {
      if (duration) {
        await duration.update({ status: "requested" });

        const allDurationsRented = await models.Duration.count({
          where: {
            date_id: date_id,
            status: { [Op.ne]: "available" },
          },
        });

        const totalDurationsForDate = await models.Duration.count({
          where: {
            date_id: date_id,
          },
        });

        if (allDurationsRented === totalDurationsForDate) {
          const rentalDate = await models.Date.findByPk(date_id);
          if (rentalDate) {
            await rentalDate.update({ status: "rented" });
          } else {
            console.error("Rental date not found for id:", date_id);
          }
        }

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
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error creating rental transaction:", error);

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
