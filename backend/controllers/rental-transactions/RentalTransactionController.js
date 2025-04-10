const { models } = require("../../models/index");
const { Op } = require("sequelize");
const { createRentalTransaction } = require("./createRentalTransactions");
const { handOverRentalTransaction } = require("./handOverRentalTransactions");
const { cancelRentalTransaction } = require("./cancelRentalTransaction");
const { getTransactionsByUserId } = require("./getTransactionsByUserId");
const { completeRentalTransaction } = require("./completeRentalTransation");
const sendTransactionEmail = require("./sendTransactionEmail.jsx");
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

module.exports = ({ emitNotification }) => {
  // Helper function to get user names
  const getUserNames = async (userId) => {
    const user = await models.User.findByPk(userId, {
      attributes: ["first_name", "last_name"],
    });
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  // Helper function to get item name
  const getRentalItemName = async (itemId, transactionType) => {
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
  // const createRentalTransaction = async (req, res) => {
  //   try {
  //     const {
  //       owner_id,
  //       renter_id,
  //       item_id,
  //       rental_date_id,
  //       rental_time_id,
  //       delivery_method,
  //     } = req.body;

  //     const missingFields = [];
  //     if (!owner_id) missingFields.push("owner_id");
  //     if (!renter_id) missingFields.push("renter_id");
  //     if (!item_id) missingFields.push("item_id");
  //     if (!rental_date_id) missingFields.push("rental_date_id");
  //     if (!rental_time_id) missingFields.push("rental_time_id");

  //     if (missingFields.length > 0) {
  //       const errorMsg =
  //         "The following fields are required: " + missingFields.join(", ");
  //       // console.error(errorMsg);
  //       return res.status(400).json({ error: errorMsg });
  //     }

  //     // Check if owner_id is the same as renter_id
  //     if (owner_id === renter_id) {
  //       const errorMsg = "The owner cannot rent the item to themselves.";
  //       // console.error(errorMsg);
  //       return res.status(400).json({ error: errorMsg });
  //     }

  //     // Create the rental transaction
  //     const rentalData = {
  //       owner_id,
  //       renter_id,
  //       item_id,
  //       rental_date_id,
  //       rental_time_id,
  //       status: "Requested",
  //       delivery_method,
  //     };

  //     const rental = await models.RentalTransaction.create(rentalData);
  //     // console.log("Rental transaction created:", rental);

  //     // Add Notification Logic Here >>>>
  //     const renterName = await getUserNames(renter_id);
  //     const itemName = await getRentalItemName(item_id);

  //     // Create notification
  //     const notification = await models.StudentNotification.create({
  //       sender_id: renter_id,
  //       recipient_id: owner_id,
  //       type: "rental_request",
  //       message: `${renterName} wants to rent ${itemName}.`,
  //       is_read: false,
  //       rental_id: rental.id,
  //     });

  //     // Emit notification using centralized emitter
  //     if (emitNotification) {
  //       emitNotification(owner_id, notification.toJSON());
  //     }

  //     // After creating the rental transaction, update the duration's status to 'requested'
  //     const duration = await models.Duration.findOne({
  //       where: {
  //         date_id: rental_date_id,
  //         id: rental_time_id, // Assuming rental_time_id corresponds to Duration ID
  //       },
  //     });

  //     if (duration) {
  //       // Set the status to 'requested'
  //       await duration.update({ status: "requested" });

  //       // Check if all durations for this date are rented
  //       const allDurationsRented = await models.Duration.count({
  //         where: {
  //           date_id: rental_date_id,
  //           status: { [Op.ne]: "available" }, // Check for rented or requested
  //         },
  //       });

  //       const totalDurationsForDate = await models.Duration.count({
  //         where: {
  //           date_id: rental_date_id,
  //         },
  //       });

  //       if (allDurationsRented === totalDurationsForDate) {
  //         // Update the date status to 'rented'
  //         const rentalDate = await models.Date.findByPk(rental_date_id);
  //         if (rentalDate) {
  //           await rentalDate.update({ status: "rented" });
  //         } else {
  //           // console.error("Rental date not found for id:", rental_date_id);
  //         }
  //       }

  //       // Check if all dates for the item are rented
  //       const allDatesRented = await models.Date.count({
  //         where: {
  //           item_id: item_id,
  //           status: "rented",
  //         },
  //       });

  //       const totalDatesForItem = await models.Date.count({
  //         where: {
  //           item_id: item_id,
  //         },
  //       });

  //       if (allDatesRented === totalDatesForItem) {
  //         // Update the item status to 'unavailable'
  //         const item = await models.Listing.findByPk(item_id);
  //         if (item) {
  //           await item.update({ status: "unavailable" });
  //         } else {
  //           // console.error("Item not found for id:", item_id);
  //         }
  //       }
  //     } else {
  //       const errorMsg = "The specified rental duration was not found.";
  //       // console.error(errorMsg);
  //       return res.status(404).json({ error: errorMsg });
  //     }

  //     // Respond with the created rental transaction
  //     res.status(201).json(rental);
  //   } catch (error) {
  //     // console.error("Error creating rental transaction:", error);

  //     // Detailed error handling
  //     let errorMessage =
  //       "An error occurred while creating the rental transaction. Please try again.";
  //     if (error.name === "SequelizeValidationError") {
  //       errorMessage =
  //         "Validation error: " +
  //         error.errors.map((err) => err.message).join(", ");
  //     } else if (error.name === "SequelizeUniqueConstraintError") {
  //       errorMessage =
  //         "Unique constraint error: " +
  //         error.errors.map((err) => err.message).join(", ");
  //     } else if (error.original) {
  //       errorMessage = error.original.sqlMessage || error.message;
  //     }

  //     // console.error("Detailed error:", errorMessage);

  //     res.status(500).json({
  //       error: errorMessage,
  //       details: error.message,
  //     });
  //   }
  // };

  // Get all rental transactions
  const getAllRentalTransactions = async (req, res) => {
    try {
      const rentals = await models.RentalTransaction.findAll({
        include: [
          {
            model: models.User,
            as: "renter",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: models.User,
            as: "owner",
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
          {
            model: models.ItemForSale,
            attributes: ["id", "item_for_sale_name", "description"],
          },
          {
            model: models.Post,
            attributes: ["id", "post_item_name"],
          },
          {
            model: models.Date,
            attributes: ["id", "date"],
          },
          {
            model: models.Duration,
            attributes: ["id", "rental_time_from", "rental_time_to"],
          },
        ],
      });

      res.status(200).json(rentals);
    } catch (error) {
      //console.error("Error fetching rental transactions:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Get a specific rental transaction by ID
  const getRentalTransactionById = async (req, res) => {
    const { id } = req.params;
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
            attributes: [
              "id",
              "listing_name",
              "category",
              "rate",
              "images",
              "location",
            ],
          },
          {
            model: models.ItemForSale,
            attributes: [
              "id",
              "item_for_sale_name",
              "price",
              "category",
              "images",
              "location",
            ],
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
        return res.status(404).json({ error: "Rental transaction not found" });
      }

      res.json({
        success: true,
        rental,
      });
    } catch (error) {
      // console.error("Error fetching rental transaction:", error);

      res.status(500).json({
        error:
          "An unexpected error occurred while fetching the rental transaction.",
        details: error.message,
      });
    }
  };

  // Get rental transactions for a specific user by userId
  // const getTransactionsByUserId = async (req, res) => {
  //   const { userId } = req.params;

  //   try {
  //     const rentals = await models.RentalTransaction.findAll({
  //       where: {
  //         [Op.or]: [{ owner_id: userId }, { renter_id: userId }],
  //       },
  //       include: [
  //         {
  //           model: models.User,
  //           as: "owner",
  //           attributes: ["user_id", "first_name", "last_name", "email"],
  //         },
  //         {
  //           model: models.User,
  //           as: "renter",
  //           attributes: ["user_id", "first_name", "last_name", "email"],
  //         },
  //         {
  //           model: models.Listing,
  //           attributes: ["id", "listing_name", "description", "rate"],
  //         },
  //         { model: models.Post, attributes: ["id", "post_item_name"] },
  //         { model: models.Date, attributes: ["id", "date"] },
  //         {
  //           model: models.Duration,
  //           attributes: ["id", "rental_time_from", "rental_time_to"],
  //         },
  //       ],
  //       order: [["createdAt", "DESC"]], // Order by createdAt in descending order
  //     });

  //     // If no rentals are found, provide a detailed message
  //     if (rentals.length === 0) {
  //       return res.status(404).json({
  //         error: "No rental transactions found for this user.",
  //         userId,
  //         timestamp: new Date().toISOString(),
  //       });
  //     }

  //     // Calculate total transactions, revenue, and successful transactions
  //     const completedRentals = rentals.filter((rental) => {
  //       return (
  //         rental.status === "Completed" && rental.owner_id === Number(userId)
  //       );
  //     });
  //     const totalTransactions = rentals.length;
  //     const revenue = completedRentals.reduce((sum, rental) => {
  //       return rental.status === "Completed" &&
  //         rental.owner_id === Number(userId)
  //         ? sum + parseFloat(rental.Listing.rate)
  //         : sum;
  //     }, 0);

  //     const successfulTransactions = rentals.filter(
  //       (rental) =>
  //         rental.status === "Completed" && rental.owner_id === Number(userId)
  //     ).length;

  //     // Return the found rentals with additional statistics
  //     res.json({
  //       totalTransactions,
  //       revenue,
  //       successfulTransactions,
  //       rentals,
  //     });
  //   } catch (error) {
  //     // console.error("Error fetching transactions:", error); // Log the error for server-side debugging

  //     // Provide detailed error messages
  //     let errorMessage =
  //       "An unexpected error occurred while fetching rental transactions.";
  //     if (error.name === "SequelizeDatabaseError") {
  //       errorMessage = "Database error: " + error.message;
  //     } else if (error.name === "SequelizeValidationError") {
  //       errorMessage =
  //         "Validation error: " +
  //         error.errors.map((err) => err.message).join(", ");
  //     } else if (error.original) {
  //       errorMessage = error.original.sqlMessage || error.message;
  //     }

  //     res.status(500).json({
  //       error: errorMessage,
  //       userId,
  //       timestamp: new Date().toISOString(),
  //       details: error.message, // Optionally include the raw error message
  //     });
  //   }
  // };

  // Update a rental transaction
  const updateRentalTransaction = async (req, res) => {
    try {
      const rental = await models.RentalTransaction.findByPk(req.params.id);
      if (!rental)
        return res.status(404).json({ error: "Rental transaction not found" });

      await rental.update(req.body);
      res.json(rental);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // Delete a rental transaction
  const deleteRentalTransaction = async (req, res) => {
    try {
      const rental = await models.RentalTransaction.findByPk(req.params.id);
      if (!rental)
        return res.status(404).json({ error: "Rental transaction not found" });

      await rental.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // ################################################################
  // Accept a rental transaction
  const acceptRentalTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    console.log("Starting acceptRentalTransaction...");
    console.log("Transaction ID:", id);
    console.log("User ID:", userId);

    try {
      console.log("Fetching rental transaction...");
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
        console.log("Rental transaction not found.");
        return res.status(404).json({ error: "Rental transaction not found." });
      }

      console.log("Rental transaction found:", rental);

      if (rental.owner_id !== userId) {
        console.log("Only the owner can accept this transaction.");
        return res
          .status(403)
          .json({ error: "Only the owner can accept this transaction." });
      }

      if (rental.status !== "Requested") {
        console.log("Only Requested rentals can be accepted.");
        return res
          .status(400)
          .json({ error: "Only Requested rentals can be accepted." });
      }

      console.log("Getting owner name...");
      const ownerName = await getUserNames(rental.owner_id);
      console.log("Owner name:", ownerName);

      console.log("Getting rental item name...");
      const itemName = await getRentalItemName(
        rental.item_id,
        rental.transaction_type
      );
      console.log("Item name:", itemName);

      // Update rental status to "Accepted"
      rental.status = "Accepted";
      console.log('Updating rental status to "Accepted"...');
      await rental.save();

      const notifType =
        rental.transaction_type === "sell"
          ? "purchase_accepted"
          : "rental_accepted";
      const action = rental.transaction_type === "sell" ? "purchase" : "rental";

      console.log("Creating notification...");
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

      console.log("Notification created:", notification);

      if (emitNotification) {
        console.log("Emitting notification...");
        emitNotification(
          rental.transaction_type === "sell"
            ? rental.buyer_id
            : rental.renter_id,
          notification.toJSON()
        );
      }

      try {
        // 📧 Email to owner (confirming they've accepted the transaction)
        console.log("Sending email to owner...");
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
        console.log("Sending email to renter/buyer...");
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

      console.log("Rental transaction accepted successfully.");
      res.json(rental);
    } catch (error) {
      console.error("Error in accepting rental transaction:", error);
      res.status(500).json({
        error: "An error occurred while accepting the rental transaction.",
        details: error.message,
      });
    }
  };

  const returnRentalTransaction = async (req, res) => {
    console.log("returnRentalTransaction called");
    const { id } = req.params;
    const { userId } = req.body;

    console.log("Request Params:", id);
    console.log("Request Body:", userId);

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

      console.log("Rental fetched:", rental);

      if (!rental) {
        console.log("Rental transaction not found");
        return res.status(404).json({ error: "Rental transaction not found." });
      }

      console.log("Rental status:", rental.status);

      const isOwner = rental.owner_id === userId;
      const isRenter = rental.renter_id === userId;

      console.log("Is Owner:", isOwner, "Is Renter:", isRenter);

      if (!isOwner && !isRenter) {
        console.log("Unauthorized action");
        return res.status(403).json({ error: "Unauthorized action." });
      }

      if (rental.status !== "HandedOver") {
        console.log("Rental status is not 'HandedOver'");
        return res
          .status(400)
          .json({ error: "Only handed over rentals can be returned." });
      }

      console.log("Fetching user names...");
      const ownerName = await getUserNames(rental.owner_id);
      const renterName = await getUserNames(rental.renter_id);
      const itemName = await getRentalItemName(rental.item_id);

      console.log(
        "Owner Name:",
        ownerName,
        "Renter Name:",
        renterName,
        "Item Name:",
        itemName
      );

      if (isOwner) {
        rental.owner_confirmed = true;
      } else if (isRenter) {
        rental.renter_confirmed = true;
      }

      console.log(
        "Owner Confirmed:",
        rental.owner_confirmed,
        "Renter Confirmed:",
        rental.renter_confirmed
      );

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
        console.log("Checking for payment capture conditions...");
        if (
          rental.stripe_payment_intent_id &&
          rental.payment_status !== "completed" &&
          (rental.owner_confirmed || rental.renter_confirmed) &&
          rental.transaction_type === "rental"
        ) {
          console.log(
            "Capturing payment for intent:",
            rental.stripe_payment_intent_id
          );

          const paymentIntent = await stripe.paymentIntents.capture(
            rental.stripe_payment_intent_id
          );
          console.log("Payment intent captured:", paymentIntent);

          const chargeId = await stripe.paymentIntents.retrieve(
            rental.stripe_payment_intent_id
          );
          console.log("Charge ID retrieved:", chargeId.latest_charge);

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
      console.log("Rental saved:", rental);

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

      console.log("Notification created:", notification);

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

  // const completeRentalTransaction = async (req, res) => {
  //   const { id } = req.params;
  //   const { userId } = req.body;

  //   try {
  //     const rental = await models.RentalTransaction.findByPk(id, {
  //       include: [
  //         {
  //           model: models.User,
  //           as: "owner",
  //           attributes: ["user_id", "first_name", "last_name", "email"],
  //         },
  //         {
  //           model: models.User,
  //           as: "renter",
  //           attributes: ["user_id", "first_name", "last_name", "email"],
  //         },
  //         {
  //           model: models.Listing,
  //           attributes: ["id", "listing_name", "description", "rate", "status"],
  //         },
  //         {
  //           model: models.Post,
  //           attributes: ["id", "post_item_name", "status"],
  //         },
  //         {
  //           model: models.Date,
  //           attributes: ["id", "date", "status", "status"],
  //         },
  //         {
  //           model: models.Duration,
  //           attributes: ["id", "rental_time_from", "rental_time_to", "status"],
  //         },
  //       ],
  //     });

  //     if (!rental) {
  //       return res.status(404).json({ error: "Rental transaction not found." });
  //     }

  //     // Check if the user is the owner or renter
  //     const isOwner = rental.owner_id === userId;
  //     const isRenter = rental.renter_id === userId;

  //     if (!isOwner && !isRenter) {
  //       return res.status(403).json({ error: "Unauthorized action." });
  //     }

  //     // Check if rental status is 'Returned'
  //     if (rental.status !== "Returned") {
  //       return res.status(400).json({
  //         error: "Only returned rentals can be completed.",
  //         currentStatus: rental.status,
  //       });
  //     }

  //     // Get user names
  //     const ownerName = await getUserNames(rental.owner_id);
  //     const renterName = await getUserNames(rental.renter_id);

  //     // Update the confirmation status
  //     if (isOwner) {
  //       rental.owner_confirmed = true;
  //     } else if (isRenter) {
  //       rental.renter_confirmed = true;
  //     }

  //     // Check if both parties have confirmed
  //     if (rental.owner_confirmed && rental.renter_confirmed) {
  //       // Update the rental status to completed
  //       rental.status = "Completed";

  //       // Reset confirmations
  //       rental.owner_confirmed = false;
  //       rental.renter_confirmed = false;

  //       // Update the availability of the duration
  //       if (rental.Duration) {
  //         await models.Duration.update(
  //           { status: "available" },
  //           { where: { id: rental.Duration.id } }
  //         );
  //       }

  //       // Update the date status if all durations are available
  //       if (rental.Date) {
  //         const allDurationsAvailable = await models.Duration.findAll({
  //           where: {
  //             date_id: rental.Date.id,
  //             status: { [Op.ne]: "available" },
  //           },
  //         });

  //         if (allDurationsAvailable.length === 0) {
  //           await models.Date.update(
  //             { status: "available" },
  //             { where: { id: rental.Date.id } }
  //           );
  //         }
  //       }

  //       // Update the listing status if all dates are available
  //       if (rental.Listing) {
  //         const allDatesUnavailable = await models.Date.findAll({
  //           where: {
  //             item_id: rental.Listing.id,
  //             status: { [Op.ne]: "available" },
  //           },
  //         });

  //         if (allDatesUnavailable.length === 0) {
  //           await models.Listing.update(
  //             { status: "approved" },
  //             { where: { id: rental.Listing.id } }
  //           );
  //         }
  //       }

  //       // Create notifications for both parties
  //       const notificationPromises = [
  //         {
  //           recipientId: rental.owner_id,
  //           message: `Rental transaction with ${renterName} has been completed successfully.`,
  //         },
  //         {
  //           recipientId: rental.renter_id,
  //           message: `Rental transaction with ${ownerName} has been completed successfully.`,
  //         },
  //       ].map(async ({ recipientId, message }) => {
  //         const notification = await models.StudentNotification.create({
  //           sender_id: userId,
  //           recipient_id: recipientId,
  //           type: "transaction_completed",
  //           message: message,
  //           is_read: false,
  //           rental_id: rental.id,
  //         });

  //         // Emit notification using centralized emitter
  //         if (emitNotification) {
  //           emitNotification(recipientId, notification.toJSON());
  //         }

  //         return notification;
  //       });
  //       await Promise.all(notificationPromises);
  //     }

  //     // Save all changes to the rental
  //     await rental.save();

  //     // Return the updated rental data
  //     res.json(rental);
  //   } catch (error) {
  //     // console.error("Error completing rental transaction:", error);
  //     return res.status(500).json({
  //       error: "An error occurred while completing the rental transaction.",
  //       details: error.message,
  //       stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  //     });
  //   }
  // };

  const declineRentalTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    console.log("Received request to decline rental transaction");
    console.log(`Transaction ID: ${id}, User ID: ${userId}`);

    try {
      console.log("Fetching rental transaction from the database");
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
        console.log("Rental transaction not found");
        return res.status(404).json({ error: "Rental transaction not found." });
      }

      console.log("Checking if the user is the owner of the transaction");
      if (rental.owner_id !== userId) {
        console.log("User is not the owner of this transaction");
        return res
          .status(403)
          .json({ error: "Only the owner can decline this transaction." });
      }

      console.log("Checking rental status");
      if (rental.status !== "Requested") {
        console.log('Rental status is not "Requested"');
        return res
          .status(400)
          .json({ error: "Only Requested rentals can be declined." });
      }

      console.log("Fetching owner and renter names");
      const ownerName = await getUserNames(rental.owner_id);
      const otherName = await getUserNames(
        rental.transaction_type === "sell" ? rental.buyer_id : rental.renter_id
      );
      const itemName = await getRentalItemName(
        rental.item_id,
        rental.transaction_type
      );

      console.log(
        `Owner Name: ${ownerName}, Other Name: ${otherName}, Item Name: ${itemName}`
      );

      console.log('Changing rental status to "Declined"');
      rental.status = "Declined";
      await rental.save();

      const notifType =
        rental.transaction_type === "sell"
          ? "purchase_declined"
          : "rental_declined";
      const action = rental.transaction_type === "sell" ? "purchase" : "rental";

      console.log("Creating notification for the renter");
      const notification = await models.StudentNotification.create({
        sender_id: userId,
        recipient_id:
          rental.transaction_type === "sell"
            ? rental.buyer_id
            : rental.renter_id,
        type: notifType,
        message: `${ownerName} has declined your ${action} request for ${itemName}.`,
        is_read: false,
        rental_id: rental.id,
      });

      if (emitNotification) {
        console.log("Emitting notification to renter");
        emitNotification(
          rental.transaction_type === "sell"
            ? rental.buyer_id
            : rental.renter_id,
          notification.toJSON()
        );
      }

      try {
        console.log("Sending decline email to renter");
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

      console.log("Sending response with rental information");
      res.json(rental);
    } catch (error) {
      console.error("Error processing decline request:", error);
      res.status(500).json({ error: error.message });
    }
  };

  return {
    createRentalTransaction: (req, res) =>
      createRentalTransaction(req, res, emitNotification),
    getAllRentalTransactions,
    getRentalTransactionById,
    getTransactionsByUserId: (req, res) =>
      getTransactionsByUserId(req, res, emitNotification),
    updateRentalTransaction,
    deleteRentalTransaction,
    acceptRentalTransaction,
    handOverRentalTransaction: (req, res) =>
      handOverRentalTransaction(req, res, emitNotification),
    returnRentalTransaction,
    completeRentalTransaction: (req, res) =>
      completeRentalTransaction(req, res, emitNotification),
    declineRentalTransaction,
    cancelRentalTransaction: (req, res) =>
      cancelRentalTransaction(req, res, emitNotification),
  };
};
