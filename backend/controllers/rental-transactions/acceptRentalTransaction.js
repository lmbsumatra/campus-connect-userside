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

  // ################################################################
  // Accept a rental transaction
  const acceptRentalTransaction = async (req, res,emitNotification) => {
    const { id } = req.params;
    const { userId } = req.body;

    // console.log("Starting acceptRentalTransaction...");
    // console.log("Transaction ID:", id);
    // console.log("User ID:", userId);

    try {
      // console.log("Fetching rental transaction...");
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
        // console.log("Rental transaction not found.");
        return res.status(404).json({ error: "Rental transaction not found." });
      }

      // console.log("Rental transaction found:", rental);

      if (rental.owner_id !== userId) {
        // console.log("Only the owner can accept this transaction.");
        return res
          .status(403)
          .json({ error: "Only the owner can accept this transaction." });
      }

      if (rental.status !== "Requested") {
        // console.log("Only Requested rentals can be accepted.");
        return res
          .status(400)
          .json({ error: "Only Requested rentals can be accepted." });
      }

      // console.log("Getting owner name...");
      const ownerName = await getUserNames(rental.owner_id);
      // console.log("Owner name:", ownerName);

      // console.log("Getting rental item name...");
      const itemName = await getRentalItemName(
        rental.item_id,
        rental.transaction_type
      );
      // console.log("Item name:", itemName);

      // Update rental status to "Accepted"
      rental.status = "Accepted";
      // console.log('Updating rental status to "Accepted"...');
      await rental.save();

      const notifType =
        rental.transaction_type === "sell"
          ? "purchase_accepted"
          : "rental_accepted";
      const action = rental.transaction_type === "sell" ? "purchase" : "rental";

      // console.log("Creating notification...");
      const notification = await models.StudentNotification.create({
        sender_id: userId,
        recipient_id:
          rental.transaction_type === "sell"
            ? rental.buyer_id
            : rental.renter_id,
        type: notifType,
        message: `${ownerName} has accepted your ${action} request for ${itemName}.`,
        is_read: false,
        rental_id: rental.id,
      });

      // console.log("Notification created:", notification);

      if (emitNotification) {
        // console.log("Emitting notification...");
        emitNotification(
          rental.transaction_type === "sell"
            ? rental.buyer_id
            : rental.renter_id,
          notification.toJSON()
        );
      }

      try {
        // 📧 Email to owner (confirming they've accepted the transaction)
        // console.log("Sending email to owner...");
        await sendTransactionEmail({
          email: rental.owner.email,
          itemName: itemName,
          transactionType: rental.transaction_type,
          amount: rental.total_amount,
          userName: `${rental.owner.first_name} ${rental.owner.last_name}`,
          recipientType: "owner",
          status: "Accepted",
        });

        // 📧 Email to renter/buyer (informing them their request was accepted)
        // console.log("Sending email to renter/buyer...");
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
          amount: rental.total_amount,
          userName: recipientName,
          recipientType:
            rental.transaction_type === "sell" ? "buyer" : "renter",
          status: "Accepted",
        });
      } catch (emailError) {
        console.error("Error sending acceptance email:", emailError);
      }

      // console.log("Rental transaction accepted successfully.");
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
