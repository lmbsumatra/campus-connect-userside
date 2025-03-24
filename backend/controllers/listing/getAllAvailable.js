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
      ],
      order: [[sequelize.literal("no_of_rentals"), "DESC"]],
    });
    const formattedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.listing_name,
        tags: JSON.parse(item.tags),
        price: item.rate,
        createdAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "For Rent",
        images: JSON.parse(item.images),
        deliveryMethod: item.delivery_mode,
        paymentMethod: item.payment_mode,
        condition: item.listing_condition,
        lateCharges: item.late_charges,
        securityDeposit: item.security_deposit,
        repairReplacement: item.repair_replacement,
        availableDates: item.rental_dates.map((date) => ({
          id: date.id,
          itemId: date.item_id,
          date: date.date,
          itemType: date.item_type,
          status: date.status,
          durations: date.durations.map((duration) => ({
            id: duration.id,
            dateId: duration.date_id,
            timeFrom: duration.rental_time_from,
            timeTo: duration.rental_time_to,
            status: duration.status,
          })),
        })),
        owner: {
          id: item.owner_id,
          fname: item.owner.first_name,
          lname: item.owner.last_name,
        },
        college: item.owner.student ? item.owner.student.college : null,
      };
    });

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

    const { q } = req.query;

    if (q) {
      const fuse = new Fuse(formattedItems, {
        keys: ["name", "desc", "category", "tags"],
        threshold: 0.3,
      });

      const results = fuse.search(q).map((result) => result.item);

      return res.status(200).json(results.length ? results : []);
    }

    // console.log(formattedItems);

    res.status(200).json(formattedItems);
  } catch (error) {
    // console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
