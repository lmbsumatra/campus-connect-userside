const { models } = require("../../models/index");
const { Op } = require("sequelize");

const createReview = async (req, res) => {
  try {
    const {
      reviewer_id,
      reviewee_id,
      item_id,
      review_type,
      transaction_id,
      rate,
      review,
    } = req.body;

    // console.log("Received request body:", req.body);

    // Check for required fields
    const missingFields = [];
    if (!reviewer_id) missingFields.push("reviewer_id");
    if (!reviewee_id) missingFields.push("reviewee_id");
    if (!review_type) missingFields.push("review_type");
    if (!item_id) missingFields.push("item_id");
    if (!transaction_id) missingFields.push("transaction_id");
    if (!rate) missingFields.push("rate");
    if (!review) missingFields.push("review");

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `The following fields are required: ${missingFields.join(", ")}`,
      });
    }

    // Validate review_type
    if (!["item", "owner", "renter", "buyer"].includes(review_type)) {
      return res.status(400).json({ error: "Invalid review type specified." });
    }

    // Step 1: Create the review and rate entry
    const newReview = await models.ReviewAndRate.create({
      reviewer_id,
      reviewee_id,
      item_id,
      review_type,
      transaction_id,
      rate,
      review,
    });

    // Step 2: Find the transaction
    const transaction = await models.RentalTransaction.findOne({
      where: { id: transaction_id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Step 3: Update rental transaction
    let updateFields = { has_review_rating: true };

    if (review_type === "owner") updateFields.renter_confirmed = true;
    if (review_type === "renter") updateFields.owner_confirmed = true;

    if (transaction.status === "Completed") {
      await models.RentalTransaction.update(updateFields, {
        where: { id: transaction_id },
      });
    }

    // Step 4: Send success response
    return res.status(201).json({
      message: "Review created successfully and transaction updated.",
      review: newReview,
    });

  } catch (error) {
    // console.error("Error creating review:", error.stack); // Logs full error trace

    let errorMessage = "An unexpected error occurred.";

    if (error.name === "SequelizeValidationError") {
      errorMessage = "Validation error: " + error.errors.map((err) => err.message).join(", ");
    } else if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage = "Unique constraint error: " + error.errors.map((err) => err.message).join(", ");
    } else if (error.name === "SequelizeForeignKeyConstraintError") {
      errorMessage = "Foreign key constraint error: Ensure all referenced IDs exist.";
    } else if (error instanceof TypeError) {
      errorMessage = "Type error: " + error.message;
    }

    return res.status(500).json({ error: errorMessage });
  }
};

module.exports = createReview;
