const { models } = require("../models/index");

exports.createRentalTransaction = async (req, res) => {
  console.log(req.body)
  try {
    const { owner_id, renter_id, item_id, rental_date_id, rental_time_id, delivery_method } = req.body;

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
      delivery_method
    };

    const rental = await models.RentalTransaction.create(rentalData);
    console.log(rental)
    res.status(201).json(rental);
  } catch (error) {
    console.error("Error creating rental transaction:", error);

    // Detailed error handling
    let errorMessage = "An error occurred while creating the rental transaction. Please try again.";
    if (error.name === 'SequelizeValidationError') {
      errorMessage = "Validation error: " + error.errors.map(err => err.message).join(", ");
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = "Unique constraint error: " + error.errors.map(err => err.message).join(", ");
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
      include: ['Borrower', 'Lender', 'Item', 'LookingForPost']
    });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific rental transaction by ID
exports.getRentalTransactionById = async (req, res) => {
  try {
    const rental = await models.RentalTransaction.findByPk(req.params.id, {
      include: ['Borrower', 'Lender', 'Item', 'LookingForPost']
    });
    if (!rental) return res.status(404).json({ error: 'Rental transaction not found' });
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a rental transaction
exports.updateRentalTransaction = async (req, res) => {
  try {
    const rental = await models.RentalTransaction.findByPk(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Rental transaction not found' });

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
    if (!rental) return res.status(404).json({ error: 'Rental transaction not found' });

    await rental.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
