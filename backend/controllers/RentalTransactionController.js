const { models } = require("../models/index");
const { Op } = require("sequelize");

exports.createRentalTransaction = async (req, res) => {
  console.log(req.body);
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
      return res.status(400).json({
        error: "The following fields are required: " + missingFields.join(", "),
      });
    }

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
    console.log(rental);
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

    res.status(500).json({
      error: errorMessage,
      details: error.message,
    });
  }
};

// Get all rental transactions
exports.getAllRentalTransactions = async (req, res) => {
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
exports.getRentalTransactionById = async (req, res) => {
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
        { model: models.RentalDate, attributes: ["id", "date"] },
        {
          model: models.RentalDuration,
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
exports.getTransactionsByUserId = async (req, res) => {
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
          attributes: ["id", "listing_name", "description"],
        },
        { model: models.Post, attributes: ["id", "post_item_name"] },
        { model: models.RentalDate, attributes: ["id", "date"] },
        {
          model: models.RentalDuration,
          attributes: ["id", "rental_time_from", "rental_time_to"],
        },
      ],
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
exports.updateRentalTransaction = async (req, res) => {
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
exports.deleteRentalTransaction = async (req, res) => {
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
exports.acceptRentalTransaction = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log(id, userId);
  try {
    const rental = await models.RentalTransaction.findByPk(id);

    if (!rental)
      return res.status(404).json({ error: "Rental transaction not found." });
    if (rental.owner_id !== userId)
      return res
        .status(403)
        .json({ error: "Only the owner can accept this transaction." });
    if (rental.status !== "Requested")
      return res
        .status(400)
        .json({ error: "Only Requested rentals can be accepted." });

    rental.status = "Accepted";
    await rental.save();
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handOverRentalTransaction = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // userId to identify who is confirming the handover
  console.log(id, userId);

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
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.returnRentalTransaction = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // userId to identify who is confirming the handover
  console.log(id, userId);

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
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeRentalTransaction = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // userId to identify who is confirming the handover
  console.log(id, userId);

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

    // Check if rental status is 'Returned'
    if (rental.status !== "Returned") {
      return res
        .status(400)
        .json({ error: "Only returned rentals can be completed." });
    }

    // Update the confirmation status
    if (isOwner) {
      rental.owner_confirmed = true;
    } else if (isRenter) {
      rental.renter_confirmed = true;
    }

    // Check if both parties have confirmed
    if (rental.owner_confirmed && rental.renter_confirmed) {
      rental.status = "Completed";
      // Reset confirmations to false after both have confirmed
      rental.owner_confirmed = false;
      rental.renter_confirmed = false;
    }

    await rental.save();
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.declineRentalTransaction = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log(id, userId);

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

    rental.status = "Declined"; // Update status to Declined
    await rental.save();
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelRentalTransaction = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log(id, userId);

  try {
    const rental = await models.RentalTransaction.findByPk(id);

    if (!rental)
      return res.status(404).json({ error: "Rental transaction not found." });
    if (rental.renter_id !== userId)
      return res
        .status(403)
        .json({ error: "Only the renter can cancel this transaction." });
    if (rental.status !== "Requested")
      return res
        .status(400)
        .json({ error: "Only Requested rentals can be cancelled." });

    rental.status = "Cancelled"; // Update status to Cancelled
    await rental.save();
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
