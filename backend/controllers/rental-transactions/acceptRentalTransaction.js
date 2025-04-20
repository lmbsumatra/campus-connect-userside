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

const acceptRentalTransaction = async (req, res, emitNotification) => {
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
      return res.status(404).json({ error: "Rental transaction not found." });
    }

    if (rental.owner_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the owner can accept this transaction." });
    }

    if (rental.status !== "Requested") {
      return res
        .status(400)
        .json({ error: "Only Requested rentals can be accepted." });
    }

    if (rental.transaction_type === "sell") {
      const item = await models.ItemForSale.findByPk(rental.item_id);

      if (item) {
        if (item.current_stock > 0) {
          item.current_stock -= rental.quantity;
          await item.save();
        } else {
          return res
            .status(400)
            .json({ error: "Insufficient stock available." });
        }
      }
    }

    const ownerName = await getUserNames(rental.owner_id);
    const itemName = await getItemName(rental.item_id, rental.transaction_type);

    rental.status = "Accepted";
    await rental.save();

    const notifType =
      rental.transaction_type === "sell"
        ? "purchase_accepted"
        : "rental_accepted";
    const action = rental.transaction_type === "sell" ? "purchase" : "rental";

    const notification = await models.StudentNotification.create({
      sender_id: userId,
      recipient_id:
        rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id,
      type: notifType,
      message: `${ownerName} has accepted your ${action} request for ${itemName}.`,
      is_read: false,
      rental_id: rental.id,
    });


    if (emitNotification) {
      emitNotification(
        rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id,
        notification.toJSON()
      );
    }

    try {
      await sendTransactionEmail({
        email: rental.owner.email,
        itemName: itemName,
        transactionType: rental.transaction_type,
        amount: rental.amount,
        userName: `${rental.owner.first_name} ${rental.owner.last_name}`,
        recipientType: "owner",
        status: "Accepted",
      });

      const recipientEmail =
        rental.transaction_type === "sell"
          ? rental.buyer.email
          : rental.renter.email;
      const recipientName =
        rental.transaction_type === "sell"
          ? `${rental.buyer.first_name} ${rental.buyer.last_name}`
          : `${rental.renter.first_name} ${rental.renter.last_name}`;

      await sendTransactionEmail({
        email: recipientEmail,
        itemName: itemName,
        transactionType: rental.transaction_type,
        amount: rental.amount,
        userName: recipientName,
        recipientType: rental.transaction_type === "sell" ? "buyer" : "renter",
        status: "Accepted",
      });
    } catch (emailError) {
      console.error("Error sending acceptance email:", emailError);
    }

    res.json(rental);
  } catch (error) {
    console.error("Error in accepting rental transaction:", error);
    res.status(500).json({
      error: "An error occurred while accepting the rental transaction.",
      details: error.message,
    });
  }
};

module.exports = { acceptRentalTransaction };
