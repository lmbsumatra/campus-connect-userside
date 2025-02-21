const { models } = require("../../models/index.js");
const { notifyAdmins } = require("../../socket.js");
const Fuse = require("fuse.js");

// Get all approved listing: displayed in home, listings page
const getAllAvailable = async (req, res) => {
  try {
    // Fetch all approved listings
    const items = await models.Listing.findAll({
      where: {
        status: "approved", // Filter for approved items
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: true,
          where: {
            item_type: "listing",
            status: "available", // Filter for available dates
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
              where: {
                status: "available", // Filter for available durations
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

    // Get query parameter
    const { q } = req.query;

    if (q) {
      // Apply Fuse.js fuzzy search
      const fuse = new Fuse(formattedItems, {
        keys: ["name", "desc", "category", "tags"], // Search in these fields
        threshold: 0.3, // Adjust for fuzziness (0 = strict, 1 = loose)
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
