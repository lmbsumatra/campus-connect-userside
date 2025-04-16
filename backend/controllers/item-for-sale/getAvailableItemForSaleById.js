const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");

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
            date: { [Op.gte]: new Date() },
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
          required: false,
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

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

    const averageOwnerRating = userRating?.averageRating
      ? parseFloat(userRating.averageRating).toFixed(1)
      : "0.0";

    let isFollowingBuyer = false;

    if (userId) {
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

    // Fetch org data if this user is a representative
    const org = await models.Org.findOne({
      where: { user_id: item.seller.user_id },
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    const formattedItem = {
      id: item.id,
      name: item.item_for_sale_name,
      tags: JSON.parse(item.tags || "[]"),
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
      images: JSON.parse(item.images || "[]"),
      location: item.location,
      averageRating,
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
      hasRepresentative: !!org,
      organization: org
        ? {
            id: org.org_id,
            name: org.name,
            description: org.description,
            logo: org.logo,
            isVerified: org.is_verified,
            isActive: org.is_active,
            createdAt: org.created_at,
            updatedAt: org.updated_at,
            category: org.category
              ? {
                  id: org.category.id,
                  name: org.category.name,
                }
              : null,
            representative: org.representative
              ? {
                  id: org.representative.user_id,
                  email: org.representative.email,
                  name: `${org.representative.first_name} ${org.representative.last_name}`,
                }
              : null,
          }
        : null,
    };

    res.status(200).json(formattedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableItemForSaleById;
