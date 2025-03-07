
const { models } = require("../../models/index");
const { Op } = require("sequelize");

const createReview = async (req, res) => {
  // console.log(req.body);
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
        error: "The following fields are required: " + missingFields.join(", "),
      });
    }

    // Validate review_type (should be one of 'item', 'owner', 'renter')
    if (!["item", "owner", "renter"].includes(review_type)) {
      return res.status(400).json({ error: "Invalid review type specified." });
    }

    // Step 1: Create the review and rate entry
    const newReview = await models.ReviewAndRate.create({
      reviewer_id,
      reviewee_id,
      item_id, // Only set item_id if review_type is 'item'
      review_type,
      transaction_id,
      rate,
      review,
    });

    // Step 2: Update the rental transaction table
    const transaction = await models.RentalTransaction.findOne({
      where: { id: transaction_id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Step 3: Handle updating the rental transaction fields
    // Set owner_confirmed or renter_confirmed to true based on the review_type
    let updateFields = {
      has_review_rating: true, // Indicate that a review has been submitted
    };

    // If the review type is 'owner', set 'owner_confirmed' to true
    if (review_type === "owner") {
      updateFields.renter_confirmed = true;
    }

    // If the review type is 'renter', set 'renter_confirmed' to true
    if (review_type === "renter") {
      updateFields.owner_confirmed = true;
    }

    // Only update the transaction if the status is 'completed'
    if (transaction.status === "Completed") {
      await models.RentalTransaction.update(updateFields, {
        where: { id: transaction_id },
      });
      // console.log(
      //   `Transaction ${transaction_id} updated successfully with review confirmation.`
      // );
    } else {
      // console.log(
      //   `Transaction ${transaction_id} is not 'completed'. No update to status or confirmations.`
      // );
    }

    // Step 4: Send a success response
    res.status(201).json({
      message: "Review created successfully and transaction updated.",
      review: newReview,
    });
    // console.log("Review and transaction update successful.");
  } catch (error) {
    console.error("Error creating review:", error);
    let errorMessage = "An error occurred while creating the review.";

    if (error.name === "SequelizeValidationError") {
      errorMessage =
        "Validation error: " +
        error.errors.map((err) => err.message).join(", ");
    } else if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage =
        "Unique constraint error: " +
        error.errors.map((err) => err.message).join(", ");
    }
    console.log({ error: errorMessage });
    res.status(500).json({ error: errorMessage });
  }
};

module.exports = createReview;