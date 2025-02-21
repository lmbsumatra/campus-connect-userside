const { models } = require("../../models/index.js");
const { notifyAdmins } = require("../../socket.js");
const Fuse = require("fuse.js");

const getAllAvailable = async (req, res) => {
  try {
    const items = await models.Listing.findAll({
      where: {
        status: "approved", 
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
          include: [
            { model: models.Student, as: "student", attributes: ["college"] },
          ],
        },
      ],
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
        condition: item.item_condition,
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

    const { q } = req.query;

    if (q) {
      const fuse = new Fuse(formattedItems, {
        keys: ["name", "desc", "category", "tags"], 
        threshold: 0.3, 
      });

      const results = fuse.search(q).map((result) => result.item);

      return res.status(200).json(results.length ? results : []);
    }

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
