const { models } = require("../../models/index");
const sequelize = require("../../config/database");
const Fuse = require("fuse.js");
const { Op } = require("sequelize");

const getAllAvailable = async (req, res) => {
  const userId = req.query.userId || "";
  try {
    const items = await models.ItemForSale.findAll({
      attributes: [
        "id",
        "item_for_sale_name",
        "tags",
        "price",
        "seller_id",
        "created_at",
        "status",
        "category",
        "images",
        "item_condition",
        "delivery_mode",
        "payment_mode",
      ],
      where: {
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: true,
          where: { item_type: "item_for_sale", status: "available" },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
              where: { status: "available" },
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["first_name", "last_name"],
          where: { email_verified: true },
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["college"],
              where: { status: "verified" },
            },
          ],
        },
        {
          model: models.ReviewAndRate,
          as: "reviews",
          required: false,
          where: { review_type: "item" },
          attributes: ["rate"],
        },
      ],
    });

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        let tags = [];
        let images = [];
        const reviews = item.reviews || [];
        const averageRating = reviews.length
          ? reviews.reduce((sum, review) => sum + review.rate, 0) /
            reviews.length
          : null;

        try {
          tags = JSON.parse(item.tags);
        } catch (error) {}

        try {
          images = JSON.parse(item.images);
        } catch (error) {}

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

        return {
          id: item.id,
          name: item.item_for_sale_name,
          tags,
          price: item.price,
          createdAt: item.created_at,
          status: item.status,
          category: item.category,
          itemType: "For Sale",
          images,
          deliveryMethod: item.delivery_mode,
          paymentMethod: item.payment_mode,
          condition: item.item_condition,
          averageRating,
          isFollowingBuyer,
          location: item.location,
          availableDates: item.available_dates.map((date) => ({
            id: date.id,
            itemId: date.item_id,
            date: date.date,
            itemType: date.item_type,
            status: date.status,
            durations: date.durations.map((duration) => ({
              id: duration.id,
              dateId: date.id,
              timeFrom: duration.rental_time_from,
              timeTo: duration.rental_time_to,
              status: duration.status,
            })),
          })),
          sellerId: item.seller_id,
          sellerFname: item.seller.first_name,
          sellerLname: item.seller.last_name,
          college: item.seller.student ? item.seller.student.college : null,
        };
      })
    );

    // Get query parameter for search
    const { q } = req.query;

    if (q) {
      const fuse = new Fuse(formattedItems, {
        keys: ["name", "category", "tags"],
        threshold: 0.3,
      });

      const results = fuse.search(q).map((result) => result.item);
      return res.status(200).json(results.length ? results : []);
    }

    res.status(200).json(formattedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
