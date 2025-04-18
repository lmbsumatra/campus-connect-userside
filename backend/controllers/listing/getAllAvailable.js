const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index.js");
const { notifyAdmins } = require("../../socket.js");
const Fuse = require("fuse.js");

const getAllAvailable = async (req, res) => {
  const userId = req.query.userId || "";
  let user;
  if (userId) {
    try {
      user = await models.User.findOne({
        where: { user_id: userId },
        attributes: ["user_id"],
        where: {
          email_verified: true,
        },
        include: [
          {
            model: models.Student,
            as: "student",
            attributes: ["college"],
            where: {
              status: "verified",
            },
          },
          {
            model: models.Follow,
            as: "follower",
            attributes: ["followee_id"],
          },
        ],
      });
    } catch (error) {
      // console.error("Error fetching user:", error);
    }
  }

  try {
    const items = await models.Listing.findAll({
      where: {
        status: "approved",
      },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM rental_transactions 
              WHERE rental_transactions.item_id = Listing.id
            )`),
            "no_of_rentals",
          ],
        ],
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: true,
          where: {
            item_type: "listing",
            status: "available",
            date: {
              [Op.gte]: new Date(), // today's date and future
            },
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
              where: {
                status: "available",
              },
            },
          ],
        },
        {
          model: models.User,
          as: "owner",
          attributes: ["first_name", "last_name"],
          where: {
            email_verified: true,
          },
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["college"],
              where: {
                status: "verified",
              },
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
      order: [[sequelize.literal("no_of_rentals"), "DESC"]],
    });

    const topRentedItemData = await models.RentalTransaction.findAll({
      attributes: [
        "item_id",
        [sequelize.fn("COUNT", sequelize.col("item_id")), "rentCount"],
      ],
      where: {
        transaction_type: "rental",
        status: "Completed",
      },
      group: ["item_id"],
      order: [[sequelize.fn("COUNT", sequelize.col("item_id")), "DESC"]],
      limit: 10,
      raw: true,
    });

    const topRentedItemIds = topRentedItemData.map((entry) => entry.item_id);

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        const reviews = item.reviews || [];
        const averageRating = reviews.length
          ? reviews.reduce((sum, review) => sum + review.rate, 0) /
            reviews.length
          : null;

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
              renter_id: { [Op.in]: followingIds },
              item_id: item.id,
            },
          });

          isFollowingBuyer = !!transaction;
        }

        const specsString =
          typeof item.specifications === "object"
            ? JSON.stringify(item.specifications)
            : item.specifications;
        const specsObject = JSON.parse(specsString);
        const specsArray = Object.values(specsObject);

        return {
          id: item.id,
          isTopForRent: topRentedItemIds.includes(item.id),
          name: item.listing_name,
          tags: JSON.parse(item.tags),
          specs: item.specifications,
          specsArray,
          price: item.rate,
          createdAt: item.created_at,
          status: item.status,
          category: item.category,
          itemType: "For Rent",
          desc: item.description,
          images: JSON.parse(item.images),
          deliveryMethod: item.delivery_mode,
          paymentMethod: item.payment_mode,
          condition: item.listing_condition,
          lateCharges: item.late_charges,
          securityDeposit: item.security_deposit,
          repairReplacement: item.repair_replacement,
          location: item.location,
          averageRating,
          isFollowingBuyer,
          availableDates: item.rental_dates.map((date) => ({
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
          owner: {
            id: item.owner.user_id,
            fname: item.owner.first_name,
            lname: item.owner.last_name,
          },
          college: item.owner.student ? item.owner.student.college : null,
        };
      })
    );

    if (user) {
      const userCollege = user.student ? user.student.college : null;
      const followedUserIds = user.follower.map((f) => f.followee_id);
      formattedItems.sort((a, b) => {
        const aFollowed = followedUserIds.includes(a.owner.id) ? 1 : 0;
        const bFollowed = followedUserIds.includes(b.owner.id) ? 1 : 0;

        const aSameCollege = a.college === userCollege ? 1 : 0;
        const bSameCollege = b.college === userCollege ? 1 : 0;

        return bFollowed - aFollowed || bSameCollege - aSameCollege;
      });
    }

    const { q, preference } = req.query;

    let filteredItems = formattedItems;
    if (preference) {
      if (preference === "top_items_for_rent") {
        filteredItems = formattedItems.filter((item) => item.isTopForRent);
      }
    }

    if (q) {
      const normalizedQuery = q.toLowerCase();

      const queryKeywords = normalizedQuery.split(" ");

      const refinedKeywords = queryKeywords.filter(
        (keyword) => keyword.trim() !== ""
      );

      const fuse = new Fuse(formattedItems, {
        keys: ["name", "desc", "category", "tags", "specsArray"],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });

      const results = fuse
        .search(refinedKeywords.join(" "))
        .map((result) => result.item);
      // console.log({ results });

      return res.status(200).json(results.length ? results : []);
    }

    res.status(200).json(filteredItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
