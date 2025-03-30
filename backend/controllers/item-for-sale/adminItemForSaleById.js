const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");

const adminItemForSaleById = async (req, res) => {
  try {
    const item = await models.ItemForSale.findByPk(req.params.id, {
      include: [
        {
          model: models.Date,
          as: "available_dates",
          where: {
            item_type: "item_for_sale",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          include: [
            {
              model: models.Student,
              as: "student",
            },
          ],
        },
        {
          model: models.ReviewAndRate,
          as: "reviews",
          where: { review_type: "item" },
          required: false, // Allow items with no reviews to still be fetched
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Calculate average rating if reviews exist
    const reviews = item.reviews || [];
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
      : null;

    // Get the average rating for this user from all reviews where they were the reviewee
    const userRating = await models.ReviewAndRate.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rate")), "averageRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
      ],
      where: {
        reviewee_id: item.seller.user_id,
        review_type: { [Op.in]: ["owner", "renter"] },
      },
      raw: true,
    });

    // Format the rating to one decimal place if it exists
    const averageOwnerRating = userRating?.averageRating
      ? parseFloat(userRating.averageRating).toFixed(1)
      : "0.0";

    const formattedItem = {
      id: item.id,
      itemName: item.item_for_sale_name,
      images: JSON.parse(item.images),
      tags: JSON.parse(item.tags),
      price: item.price,
      createdAt: item.created_at,
      deliveryMethod: item.delivery_mode,
      itemCondition: item.item_condition,
      paymentMethod: item.payment_mode,
      status: item.status,
      category: item.category,
      itemType: "For Sale",
      desc: item.description,
      specs: item.specifications,
      location: item.location,
      availableDates: item.available_dates.map((date) => ({
        id: date.id,
        itemId: date.item_id,
        date: date.date,
        status: date.status,
        durations: date.durations.map((duration) => ({
          id: duration.id,
          dateId: duration.date_id,
          timeFrom: duration.rental_time_from,
          timeTo: duration.rental_time_to,
          status: duration.status,
        })),
      })),
      seller: {
        id: item.seller.user_id,
        fname: item.seller.first_name,
        lname: item.seller.last_name,
        college: item.seller.student.college,
        rating: averageOwnerRating,
        profilePic: item.seller.student.profile_pic,
      },
      reviews: reviews.map((review) => ({
        id: review.id,
        rate: review.rate,
        review: review.review,
        createdAt: review.created_at,
        reviewerId: review.reviewer_id,
      })),
      averageRating,
    };

    res.status(200).json(formattedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = adminItemForSaleById;
