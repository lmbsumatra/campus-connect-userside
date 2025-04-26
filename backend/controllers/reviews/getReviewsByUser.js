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
        reviewer_id: { [Op.ne]: userId }, 
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
      ],
      order: [
        ["transaction_id", "ASC"],
        ["created_at", "ASC"],
      ], 
    });

    const formattedReviews = await Promise.all(
      reviews.map(async (review) => {
        const transaction = await models.RentalTransaction.findByPk(review.transaction_id, {
          attributes: ["transaction_type", "item_id"]
        });
        
        let itemDetails = null;
        
        if (transaction) {
          if (transaction.transaction_type === "rental") {
            const listing = await models.Listing.findByPk(review.item_id, {
              attributes: ["listing_name", "images", "rate"]
            });
            if (listing) {
              itemDetails = {
                name: listing.listing_name,
                img: listing.images ? JSON.parse(listing.images) : null,
                rate: listing.rate,
                type: "rental"
              };
            }
          } else if (transaction.transaction_type === "sell") {
            const itemForSale = await models.ItemForSale.findByPk(review.item_id, {
              attributes: ["item_for_sale_name", "images", "price"]
            });
            if (itemForSale) {
              itemDetails = {
                name: itemForSale.item_for_sale_name,
                img: itemForSale.images ? JSON.parse(itemForSale.images) : null,
                rate: itemForSale.price, 
                type: "sell"
              };
            }
          }
        }

        return {
          id: review.id,
          reviewType: review.review_type,
          transactionId: review.transaction_id,
          transactionType: transaction ? transaction.transaction_type : null,
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
          item: itemDetails
        };
      })
    );

    res.status(200).json(formattedReviews);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching reviews." });
  }
};

module.exports = getReviewsByUser;