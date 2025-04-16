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
        "specifications",
        "location",
      ],
      where: { status: "approved" },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: true,
          where: {
            item_type: "item_for_sale",
            status: "available",
            date: { [Op.gte]: new Date() },
          },
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
          attributes: ["user_id", "first_name", "last_name", "email_verified"],
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

    // If user is logged in, pre-fetch all followings
    let followingIds = [];
    if (userId) {
      const followings = await models.Follow.findAll({
        where: { follower_id: userId },
        attributes: ["followee_id"],
        raw: true,
      });
      followingIds = followings.map((f) => f.followee_id);
    }

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        let tags = [];
        let images = [];
        let specsArray = [];
        let specsRaw = item.specifications;

        try {
          tags = JSON.parse(item.tags || "[]");
          images = JSON.parse(item.images || "[]");

          if (typeof specsRaw === "string") {
            specsRaw = JSON.parse(specsRaw);
          }
          specsArray =
            specsRaw && typeof specsRaw === "object"
              ? Object.values(specsRaw)
              : [];
        } catch (e) {
          specsArray = [];
        }

        const averageRating = item.reviews?.length
          ? (
              item.reviews.reduce((sum, review) => sum + review.rate, 0) /
              item.reviews.length
            ).toFixed(1)
          : null;

        let isFollowingBuyer = false;
        if (userId && followingIds.includes(item.seller_id)) {
          const transaction = await models.RentalTransaction.findOne({
            where: {
              buyer_id: { [Op.in]: followingIds },
              item_id: item.id,
            },
          });
          isFollowingBuyer = !!transaction;
        }

        // Fetch organization (if seller is a representative)
        const org = await models.Org.findOne({
          where: { user_id: item.seller_id },
          include: [
            { model: models.OrgCategory, as: "category" },
            { model: models.User, as: "representative" },
          ],
        });

        return {
          id: item.id,
          name: item.item_for_sale_name,
          tags,
          specs: item.specifications,
          specsArray,
          price: item.price,
          createdAt: item.created_at,
          status: item.status,
          category: item.category,
          itemType: "For Sale",
          images,
          deliveryMethod: item.delivery_mode,
          stock: item.current_stock,
          paymentMethod: item.payment_mode,
          condition: item.item_condition,
          location: item.location,
          averageRating,
          isFollowingBuyer,
          sellerId: item.seller_id,
          sellerFname: item.seller.first_name,
          sellerLname: item.seller.last_name,
          college: item.seller.student?.college || null,
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
      })
    );

    const { q, preference } = req.query;

    let filteredItems = [...formattedItems];

    // Filter by new
    if (preference === "new_items_for_sale") {
      filteredItems.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    // Search
    if (q) {
      const fuse = new Fuse(filteredItems, {
        keys: ["name", "category", "tags", "specsArray"],
        threshold: 0.4,
        ignoreLocation: true,
        includeScore: true,
      });

      const keywordResults = fuse.search(q);
      const seen = new Set();
      const results = [];

      for (const result of keywordResults) {
        const itemId = result.item.id;
        if (!seen.has(itemId)) {
          seen.add(itemId);
          results.push(result.item);
        }
      }

      return res.status(200).json(results);
    }

    return res.status(200).json(filteredItems);
  } catch (error) {
    console.error("getAllAvailable error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
