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

const declineRentalTransaction = async (req, res, emitNotification) => {
  const { id } = req.params;
  const { userId } = req.body;

  // console.log("Received request to decline rental transaction");
  // console.log(`Transaction ID: ${id}, User ID: ${userId}`);

  try {
    // console.log("Fetching rental transaction from the database");
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
      // console.log("Rental transaction not found");
      return res.status(404).json({ error: "Rental transaction not found." });
    }

    // console.log("Checking if the user is the owner of the transaction");
    if (rental.owner_id !== userId) {
      // console.log("User is not the owner of this transaction");
      return res
        .status(403)
        .json({ error: "Only the owner can decline this transaction." });
    }

    // console.log("Checking rental status");
    if (rental.status !== "Requested") {
      // console.log('Rental status is not "Requested"');
      return res
        .status(400)
        .json({ error: "Only Requested rentals can be declined." });
    }

    // console.log("Fetching owner and renter names");
    const ownerName = await getUserNames(rental.owner_id);
    const otherName = await getUserNames(
      rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id
    );
    const itemName = await getRentalItemName(
      rental.item_id,
      rental.transaction_type
    );

    // console.log(
    //   `Owner Name: ${ownerName}, Other Name: ${otherName}, Item Name: ${itemName}`
    // );

    // console.log('Changing rental status to "Declined"');
    rental.status = "Declined";
    await rental.save();

    const notifType =
      rental.transaction_type === "sell"
        ? "purchase_declined"
        : "rental_declined";
    const action = rental.transaction_type === "sell" ? "purchase" : "rental";

    // console.log("Creating notification for the renter");
    const notification = await models.StudentNotification.create({
      sender_id: userId,
      recipient_id:
        rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id,
      type: notifType,
      message: `${ownerName} has declined your ${action} request for ${itemName}.`,
      is_read: false,
      rental_id: rental.id,
    });

    if (emitNotification) {
      // console.log("Emitting notification to renter");
      emitNotification(
        rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id,
        notification.toJSON()
      );
    }

    try {
      // console.log("Sending decline email to renter");
      await sendTransactionEmail({
        email:
          rental.transaction_type === "sell"
            ? rental.buyer.email
            : rental.renter.email,
        itemName,
        transactionType: rental.transaction_type,
        userName: otherName,
        recipientType: "renter",
        status: "Declined",
      });
    } catch (emailError) {
      console.error("Error sending decline email:", emailError);
    }

    // console.log("Sending response with rental information");
    res.json(rental);
  } catch (error) {
    console.error("Error processing decline request:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { declineRentalTransaction };
