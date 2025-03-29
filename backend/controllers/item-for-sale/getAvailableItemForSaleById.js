const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");

// Get a single approved item by ID with associated rental dates, durations, and renter info
const getAvailableItemForSaleById = async (req, res) => {
  const userId = req.query.userId || "";

  try {
    const item = await models.ItemForSale.findOne({
      where: {
        id: req.params.id,
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          where: {
            item_type: "item_for_sale",
            status: "available",
          },
          required: true,
          include: [
            {
              model: models.Duration,
              as: "durations",
              where: { status: "available" },
              required: true,
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          where: { email_verified: true },
          include: [
            {
              model: models.Student,
              as: "student",
              where: { status: "verified" },
            },
          ],
        },
        {
          model: models.ReviewAndRate,
          as: "reviews",
          where: { review_type: "item" },
          attributes: ["rate"],
          required: false, // Allow items with no reviews to be fetched
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Calculate average rating
    const reviews = item.reviews || [];
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
      : null;

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

    let isFollowingBuyer = false;

    if (userId) {
      // Only run this section if user is logged in
      const followings = await models.Follow.findAll({
        where: { follower_id: userId },
        attributes: ["followee_id"],
        raw: true,
      });

      const followingIds = followings.map((follow) => follow.followee_id);

      const transaction = await models.RentalTransaction.findOne({
        where: {
          buyer_id: { [Op.in]: followingIds },
          item_id: item.id,
        },
      });

      isFollowingBuyer = !!transaction;
    }

    // Format the response
    const formattedItem = {
      id: item.id,
      name: item.item_for_sale_name,
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
      images: JSON.parse(item.images),
      averageRating, // Including average rating in the response
      isFollowingBuyer,
      rentalDates: item.available_dates.map((date) => ({
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
    };

    res.status(200).json(formattedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableItemForSaleById;
