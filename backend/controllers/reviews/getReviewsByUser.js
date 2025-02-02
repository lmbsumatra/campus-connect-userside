const { models } = require("../../models/index");
const { Op } = require("sequelize");

const getReviewsByUser = async (req, res) => {
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
      attributes: [
        "id",
        "review_type",
        "transaction_id",
        "item_id",
        "rate",
        "review",
        "created_at",
      ],
      include: [
        {
          model: models.User,
          as: "reviewer",
          attributes: ["user_id", "first_name", "last_name", "email"],
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["id", "tup_id", "college", "profile_pic"],
            },
          ],
        },
        {
          model: models.Listing,
          as: "listing",
          attributes: ["listing_name", "images", "rate"],
        },
      ],
      order: [
        ["transaction_id", "ASC"],
        ["created_at", "ASC"],
      ], // Sort by transaction and time
    });

    const formattedReviews = reviews.map((review) => {
      return {
        id: review.id,
        reviewType: review.review_type,
        transactionId: review.transaction_id,
        rate: review.rate,
        itemId: review.item_id,
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
                profilePic: review.reviewer.student.profile_pic,
              }
            : null,
        },
        listing: {
          name: review.listing.listing_name,
          img: JSON.parse(review.listing.images) || null,
          rate: review.listing.rate,
        },
      };
    });
    res.status(200).json(formattedReviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching reviews." });
  }
};

module.exports = getReviewsByUser;
