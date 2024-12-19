const { models } = require("../../models/index.js");
const { notifyAdmins } = require("../../socket.js");

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
        },
      ],
    });

    const formattedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.listing_name,
        tags: item.tags,
        price: item.rate,
        createdAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "Rent",
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
        ownerId: item.owner_id,
        ownerFname: item.owner.first_name,
        ownerLname: item.owner.last_name,
      };
    });

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
