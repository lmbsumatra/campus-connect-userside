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
      include: [
        {
          model: models.User,
          as: "owner",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: models.User,
          as: "renter",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: models.User,
          as: "buyer",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: models.Listing,
          attributes: ["id", "listing_name"],
        },
        {
          model: models.ItemForSale,
          attributes: ["id", "item_for_sale_name"],
        },
        {
          model: models.Post,
          attributes: ["id", "post_item_name"],
        },
      ],
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

    // Step 4: Create notification based on review type
    let itemName = "Unknown Item";
    if (transaction.Listing) {
      itemName = transaction.Listing.listing_name;
    } else if (transaction.ItemForSale) {
      itemName = transaction.ItemForSale.item_for_sale_name;
    } else if (transaction.Post) {
      itemName = transaction.Post.post_item_name;
    }

    let notificationData = {
      is_read: false,
      rental_id: transaction_id,
    };

    const reviewerName = getNameFromTransaction(transaction, reviewer_id);

    // Determine notification type and recipient based on review_type
    if (review_type === "item") {
      notificationData.sender_id = reviewer_id;
      notificationData.recipient_id = transaction.owner_id;
      notificationData.type = "item_reviewed";
      notificationData.message = `${reviewerName} left a review for your item: ${itemName}`;
    } else if (review_type === "owner") {
      notificationData.sender_id = reviewer_id;
      notificationData.recipient_id = transaction.owner_id;
      notificationData.type = "owner_reviewed";
      notificationData.message = `${reviewerName} left a review for you`;
    } else if (review_type === "renter") {
      notificationData.sender_id = reviewer_id;
      notificationData.recipient_id = transaction.renter_id;
      notificationData.type = "renter_reviewed";
      notificationData.message = `${reviewerName} left a review for you`;
    } else if (review_type === "buyer") {
      notificationData.sender_id = reviewer_id;
      notificationData.recipient_id = transaction.buyer_id;
      notificationData.type = "buyer_reviewed";
      notificationData.message = `${reviewerName} left a review for you`;
    }

    // Create the notification in the database
    if (
      notificationData.recipient_id &&
      notificationData.recipient_id !== reviewer_id
    ) {
      const notification = await models.StudentNotification.create(
        notificationData
      );

      // If socket emitter function exists in req object (passed from route), emit the notification
      if (req.emitNotification) {
        req.emitNotification(
          notificationData.recipient_id,
          notification.toJSON()
        );
      }
    }

    // Step 5: Send success response
    return res.status(201).json({
      message: "Review created successfully and transaction updated.",
      review: newReview,
    });
  } catch (error) {
    // console.error("Error creating review:", error.stack); // Logs full error trace

    let errorMessage = "An unexpected error occurred.";

    if (error.name === "SequelizeValidationError") {
      errorMessage =
        "Validation error: " +
        error.errors.map((err) => err.message).join(", ");
    } else if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage =
        "Unique constraint error: " +
        error.errors.map((err) => err.message).join(", ");
    } else if (error.name === "SequelizeForeignKeyConstraintError") {
      errorMessage =
        "Foreign key constraint error: Ensure all referenced IDs exist.";
    } else if (error instanceof TypeError) {
      errorMessage = "Type error: " + error.message;
    }

    return res.status(500).json({ error: errorMessage });
  }
};

// Helper function to get name from transaction based on user ID
function getNameFromTransaction(transaction, userId) {
  if (transaction.owner && transaction.owner.user_id === userId) {
    return `${transaction.owner.first_name} ${transaction.owner.last_name}`;
  } else if (transaction.renter && transaction.renter.user_id === userId) {
    return `${transaction.renter.first_name} ${transaction.renter.last_name}`;
  } else if (transaction.buyer && transaction.buyer.user_id === userId) {
    return `${transaction.buyer.first_name} ${transaction.buyer.last_name}`;
  }
  return "Someone";
}

module.exports = createReview;
