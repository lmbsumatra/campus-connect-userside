const { models } = require("../models/index");
const { Op } = require("sequelize");
const StudentNotification = require("../models/StudentNotificationModel");

module.exports = ({ emitNotification }) => {
  // Helper function to get user names
  const getUserNames = async (userId) => {
    const user = await models.User.findByPk(userId, {
      attributes: ["first_name", "last_name"],
    });
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  // Helper function to get rental item name
  const getRentalItemName = async (itemId) => {
    const item = await models.Listing.findByPk(itemId, {
      attributes: ["listing_name"],
    });
    return item ? item.listing_name : "Unknown Item";
  };

  const createRentalTransaction = async (req, res) => {
    try {
      const {
        owner_id,
        renter_id,
        item_id,
        rental_date_id,
        rental_time_id,
        delivery_method,
      } = req.body;

      const missingFields = [];
      if (!owner_id) missingFields.push("owner_id");
      if (!renter_id) missingFields.push("renter_id");
      if (!item_id) missingFields.push("item_id");
      if (!rental_date_id) missingFields.push("rental_date_id");
      if (!rental_time_id) missingFields.push("rental_time_id");

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
        item_id,
        rental_date_id,
        rental_time_id,
        status: "Requested",
        delivery_method,
      };

      const rental = await models.RentalTransaction.create(rentalData);
      console.log("Rental transaction created:", rental);

      // Add Notification Logic Here >>>>
      const renterName = await getUserNames(renter_id);
      const itemName = await getRentalItemName(item_id);

      // Create notification
      const notification = await models.StudentNotification.create({
        sender_id: renter_id,
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
          date_id: rental_date_id,
          id: rental_time_id, // Assuming rental_time_id corresponds to Duration ID
        },
      });

      if (duration) {
        // Set the status to 'requested'
        await duration.update({ status: "requested" });

        // Check if all durations for this date are rented
        const allDurationsRented = await models.Duration.count({
          where: {
            date_id: rental_date_id,
            status: { [Op.ne]: "available" }, // Check for rented or requested
          },
        });

        const totalDurationsForDate = await models.Duration.count({
          where: {
            date_id: rental_date_id,
          },
        });

        if (allDurationsRented === totalDurationsForDate) {
          // Update the date status to 'rented'
          const rentalDate = await models.Date.findByPk(rental_date_id);
          if (rentalDate) {
            await rentalDate.update({ status: "rented" });
          } else {
            console.error("Rental date not found for id:", rental_date_id);
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

      // Respond with the created rental transaction
      res.status(201).json(rental);
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

  // Get all rental transactions
  const getAllRentalTransactions = async (req, res) => {
    try {
      const rentals = await models.RentalTransaction.findAll({
        include: ["Borrower", "Lender", "Item", "LookingForPost"],
      });
      res.json(rentals);
    } catch (error) {
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
        return res.status(404).json({ error: "Rental transaction not found" });
      }

      res.json({
        success: true,
        rental,
      });
    } catch (error) {
      console.error("Error fetching rental transaction:", error);

      res.status(500).json({
        error:
          "An unexpected error occurred while fetching the rental transaction.",
        details: error.message,
      });
    }
  };

  // Get rental transactions for a specific user by userId
  const getTransactionsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
      const rentals = await models.RentalTransaction.findAll({
        where: {
          [Op.or]: [{ owner_id: userId }, { renter_id: userId }],
        },
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
        order: [["createdAt", "DESC"]], // Order by createdAt in descending order
      });

      // If no rentals are found, provide a detailed message
      if (rentals.length === 0) {
        return res.status(404).json({
          error: "No rental transactions found for this user.",
          userId,
          timestamp: new Date().toISOString(),
        });
      }

      // Return the found rentals
      res.json(rentals);
    } catch (error) {
      console.error("Error fetching transactions:", error); // Log the error for server-side debugging

      // Provide detailed error messages
      let errorMessage =
        "An unexpected error occurred while fetching rental transactions.";
      if (error.name === "SequelizeDatabaseError") {
        errorMessage = "Database error: " + error.message;
      } else if (error.name === "SequelizeValidationError") {
        errorMessage =
          "Validation error: " +
          error.errors.map((err) => err.message).join(", ");
      } else if (error.original) {
        errorMessage = error.original.sqlMessage || error.message;
      }

      res.status(500).json({
        error: errorMessage,
        userId,
        timestamp: new Date().toISOString(),
        details: error.message, // Optionally include the raw error message
      });
    }
  };

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

    try {
      const rental = await models.RentalTransaction.findByPk(id);

      if (!rental) {
        return res.status(404).json({ error: "Rental transaction not found." });
      }

      // Check if the user is the owner
      if (rental.owner_id !== userId) {
        return res
          .status(403)
          .json({ error: "Only the owner can accept this transaction." });
      }

      // Check if the rental status is "Requested"
      if (rental.status !== "Requested") {
        return res
          .status(400)
          .json({ error: "Only Requested rentals can be accepted." });
      }

      // Get user names
      const ownerName = await getUserNames(rental.owner_id);
      const itemName = await getRentalItemName(rental.item_id);

      // Update the rental status to "Accepted"
      rental.status = "Accepted";
      await rental.save();

      // Create a notification for the renter
      const notification = await models.StudentNotification.create({
        sender_id: userId,
        recipient_id: rental.renter_id,
        type: "rental_accepted",
        message: `${ownerName} has accepted your rental request for ${itemName}.`,
        is_read: false,
        rental_id: rental.id,
      });

      // Emit notification using centralized emitter
      if (emitNotification) {
        emitNotification(rental.renter_id, notification.toJSON());
      }

      // Return the updated rental transaction
      res.json(rental);
    } catch (error) {
      console.error("Error accepting rental transaction:", error);
      res.status(500).json({
        error: "An error occurred while accepting the rental transaction.",
        details: error.message,
      });
    }
  };
  const handOverRentalTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // userId to identify who is confirming the handover

    try {
      const rental = await models.RentalTransaction.findByPk(id);

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

      await rental.save();

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

  const returnRentalTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // userId to identify who is confirming the handover

    try {
      const rental = await models.RentalTransaction.findByPk(id);

      if (!rental)
        return res.status(404).json({ error: "Rental transaction not found." });

      // Check if the user is the owner or renter
      const isOwner = rental.owner_id === userId;
      const isRenter = rental.renter_id === userId;

      if (!isOwner && !isRenter) {
        return res.status(403).json({ error: "Unauthorized action." });
      }

      // Check if rental status is 'HandOver'
      if (rental.status !== "HandedOver") {
        return res
          .status(400)
          .json({ error: "Only handed over rentals can be returned." });
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
        rental.status = "Returned";
        // Reset confirmations to false after both have confirmed
        rental.owner_confirmed = false;
        rental.renter_confirmed = false;
      }

      await rental.save();

      let recipientId;
      let message;

      if (isOwner) {
        recipientId = rental.renter_id;
        message = `${ownerName} has confirmed receiving ${itemName}. Please confirm complete transaction.`;
      } else if (isRenter) {
        recipientId = rental.owner_id;
        message = `${renterName} has confirmed return of ${itemName}. Please confirm receipt and complete transaction.`;
      }

      // Create Return Notification
      const notification = await models.StudentNotification.create({
        sender_id: userId,
        recipient_id: recipientId,
        type: "return_confirmed",
        message: message,
        is_read: false,
        rental_id: rental.id,
      });

      // Emit notification using centralized emitter
      if (emitNotification) {
        emitNotification(recipientId, notification.toJSON());
      }
      res.json(rental);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const completeRentalTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
      const rental = await models.RentalTransaction.findByPk(id, {
        include: [
          {
            model: models.Listing,
            attributes: ["id", "status"],
          },
          {
            model: models.Date,
            attributes: ["id", "status"],
          },
          {
            model: models.Duration,
            attributes: ["id", "status"],
          },
        ],
      });

      if (!rental) {
        return res.status(404).json({ error: "Rental transaction not found." });
      }

      // Check if the user is the owner or renter
      const isOwner = rental.owner_id === userId;
      const isRenter = rental.renter_id === userId;

      if (!isOwner && !isRenter) {
        return res.status(403).json({ error: "Unauthorized action." });
      }

      // Check if rental status is 'Returned'
      if (rental.status !== "Returned") {
        return res.status(400).json({
          error: "Only returned rentals can be completed.",
          currentStatus: rental.status,
        });
      }

      // Get user names
      const ownerName = await getUserNames(rental.owner_id);
      const renterName = await getUserNames(rental.renter_id);

      // Update the confirmation status
      if (isOwner) {
        rental.owner_confirmed = true;
      } else if (isRenter) {
        rental.renter_confirmed = true;
      }

      // Check if both parties have confirmed
      if (rental.owner_confirmed && rental.renter_confirmed) {
        // Update the rental status to completed
        rental.status = "Completed";

        // Reset confirmations
        rental.owner_confirmed = false;
        rental.renter_confirmed = false;

        // Update the availability of the duration
        if (rental.Duration) {
          await models.Duration.update(
            { status: "available" },
            { where: { id: rental.Duration.id } }
          );
        }

        // Update the date status if all durations are available
        if (rental.Date) {
          const allDurationsAvailable = await models.Duration.findAll({
            where: {
              date_id: rental.Date.id,
              status: { [Op.ne]: "available" },
            },
          });

          if (allDurationsAvailable.length === 0) {
            await models.Date.update(
              { status: "available" },
              { where: { id: rental.Date.id } }
            );
          }
        }

        // Update the listing status if all dates are available
        if (rental.Listing) {
          const allDatesUnavailable = await models.Date.findAll({
            where: {
              item_id: rental.Listing.id,
              status: { [Op.ne]: "available" },
            },
          });

          if (allDatesUnavailable.length === 0) {
            await models.Listing.update(
              { status: "approved" },
              { where: { id: rental.Listing.id } }
            );
          }
        }

        // Create notifications for both parties
        const notificationPromises = [
          {
            recipientId: rental.owner_id,
            message: `Rental transaction with ${renterName} has been completed successfully.`,
          },
          {
            recipientId: rental.renter_id,
            message: `Rental transaction with ${ownerName} has been completed successfully.`,
          },
        ].map(async ({ recipientId, message }) => {
          const notification = await models.StudentNotification.create({
            sender_id: userId,
            recipient_id: recipientId,
            type: "transaction_completed",
            message: message,
            is_read: false,
            rental_id: rental.id,
          });

          // Emit notification using centralized emitter
          if (emitNotification) {
            emitNotification(recipientId, notification.toJSON());
          }

          return notification;
        });
        await Promise.all(notificationPromises);
      }

      // Save all changes to the rental
      await rental.save();

      // Return the updated rental with a success message
      return res.json({
        success: true,
        message:
          rental.status === "Completed"
            ? "Rental transaction has been completed successfully."
            : "Confirmation recorded successfully.",
        rental: rental,
      });
    } catch (error) {
      console.error("Error completing rental transaction:", error);
      return res.status(500).json({
        error: "An error occurred while completing the rental transaction.",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  };

  const declineRentalTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
      const rental = await models.RentalTransaction.findByPk(id);

      if (!rental)
        return res.status(404).json({ error: "Rental transaction not found." });
      if (rental.owner_id !== userId)
        return res
          .status(403)
          .json({ error: "Only the owner can decline this transaction." });
      if (rental.status !== "Requested")
        return res
          .status(400)
          .json({ error: "Only Requested rentals can be declined." });

      const ownerName = await getUserNames(rental.owner_id);
      const itemName = await getRentalItemName(rental.item_id);

      rental.status = "Declined"; // Update status to Declined
      await rental.save();

      // Inside declineRentalTransaction
      const notification = await models.StudentNotification.create({
        sender_id: userId,
        recipient_id: rental.renter_id,
        type: "rental_declined",
        message: `${ownerName} has declined your rental request for ${itemName}.`,
        is_read: false,
        rental_id: rental.id,
      });
      // Emit notification using centralized emitter
      if (emitNotification) {
        emitNotification(rental.renter_id, notification.toJSON());
      }

      res.json(rental);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const cancelRentalTransaction = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
      const rental = await models.RentalTransaction.findByPk(id);

      if (!rental) {
        return res.status(404).json({ error: "Rental transaction not found." });
      }

      if (rental.renter_id !== userId) {
        return res
          .status(403)
          .json({ error: "Only the renter can cancel this transaction." });
      }

      if (rental.status !== "Requested") {
        return res
          .status(400)
          .json({ error: "Only Requested rentals can be cancelled." });
      }

      // Retrieve rental date and time info
      const { rental_date_id, rental_time_id, item_id } = rental;

      const renterName = await getUserNames(rental.renter_id);
      const itemName = await getRentalItemName(rental.item_id);

      // Set rental status to 'Cancelled'
      rental.status = "Cancelled";

      // Get the rental duration and revert its status to 'available'
      const duration = await models.Duration.findOne({
        where: {
          date_id: rental_date_id,
          id: rental_time_id,
        },
      });

      if (duration) {
        await duration.update({ status: "available" });

        // Check if at least one duration for this date is now available
        const anyDurationsAvailable = await models.Duration.count({
          where: {
            date_id: rental_date_id,
            status: "available",
          },
        });

        if (anyDurationsAvailable > 0) {
          // Update the date status to 'available' if at least one duration is free
          const rentalDate = await models.Date.findByPk(rental_date_id);
          if (rentalDate) {
            await rentalDate.update({ status: "available" });
          }
        }

        // Check if at least one date for the item is available
        const anyDatesAvailable = await models.Date.count({
          where: {
            item_id: item_id,
            status: "available",
          },
        });

        if (anyDatesAvailable > 0) {
          // Update the item status to 'available' if at least one date is available
          const item = await models.Listing.findByPk(item_id);
          if (item) {
            await item.update({ status: "approved" });
          }
        }
      } else {
        return res.status(404).json({ error: "Rental duration not found." });
      }

      // Save the rental transaction with the updated status
      await rental.save();

      // Inside cancelRentalTransaction
      const notification = await models.StudentNotification.create({
        sender_id: userId,
        recipient_id: rental.owner_id,
        type: "rental_cancelled",
        message: `${renterName} has cancelled the rental request for ${itemName}.`,
        is_read: false,
        rental_id: rental.id,
      });
      // Emit notification using centralized emitter
      if (emitNotification) {
        emitNotification(rental.renter_id, notification.toJSON());
      }

      // Return the updated rental data
      res.json(rental);
    } catch (error) {
      console.error("Error canceling rental transaction:", error);
      res.status(500).json({ error: error.message });
    }
  };
  return {
    createRentalTransaction,
    getAllRentalTransactions,
    getRentalTransactionById,
    getTransactionsByUserId,
    updateRentalTransaction,
    deleteRentalTransaction,
    acceptRentalTransaction,
    handOverRentalTransaction,
    returnRentalTransaction,
    completeRentalTransaction,
    declineRentalTransaction,
    cancelRentalTransaction,
  };
};
