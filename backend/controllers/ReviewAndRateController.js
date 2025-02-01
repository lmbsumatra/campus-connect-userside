const { models } = require("../models/index");
const { Op } = require("sequelize");

exports.createReview = async (req, res) => {
  console.log(req.body);
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
      console.log(
        `Transaction ${transaction_id} updated successfully with review confirmation.`
      );
    } else {
      console.log(
        `Transaction ${transaction_id} is not 'completed'. No update to status or confirmations.`
      );
    }

    // Step 4: Send a success response
    res.status(201).json({
      message: "Review created successfully and transaction updated.",
      review: newReview,
    });
    console.log("Review and transaction update successful.");
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

exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const reviews = await models.ReviewAndRate.findAll({
      where: {
        reviewee_id: userId,
        reviewer_id: { [Op.ne]: userId }, // Exclude self-reviews
      },
      include: [
        {
          model: models.User,
          as: "reviewer",
          attributes: ["user_id", "first_name", "last_name", "email"],
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["id", "tup_id", "college"],
            },
          ],
        },
      ],
      order: [
        ["transaction_id", "ASC"],
        ["created_at", "ASC"],
      ], // Sort by transaction and time
    });

    // Group reviews by transactionId
    const groupedReviews = reviews.reduce((acc, review) => {
      const transactionId = review.transaction_id;

      if (!acc[transactionId]) {
        acc[transactionId] = {
          transactionId,
          rentalReview: [], // Holds owner + item reviews
          renterReview: null, // Holds renter review
        };
      }

      const formattedReview = {
        id: review.id,
        reviewType: review.review_type,
        rate: review.rate,
        review: review.review,
        createdAt: review.created_at,
        reviewer: {
          userId: review.reviewer?.user_id,
          fname: review.reviewer?.first_name,
          lname: review.reviewer?.last_name,
          email: review.reviewer?.email,
          student: review.reviewer?.student
            ? {
                id: review.reviewer.student.id,
                tupId: review.reviewer.student.tup_id,
                college: review.reviewer.student.college,
              }
            : null,
        },
      };

      if (review.review_type === "owner" || review.review_type === "item") {
        acc[transactionId].rentalReview.push(formattedReview); // Add to rentalReview array
      } else if (review.review_type === "renter") {
        acc[transactionId].renterReview = formattedReview; // Store renterReview separately
      }

      return acc;
    }, {});

    res.status(200).json(Object.values(groupedReviews));
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "An error occurred while fetching reviews." });
  }
};
