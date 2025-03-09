const { Op } = require("sequelize");
const { models } = require("../../models");

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

const createRentalTransaction = async (req, res, emitNotification) => {
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
    // console.log("Rental transaction created:", rental);

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

module.exports = { createRentalTransaction };
