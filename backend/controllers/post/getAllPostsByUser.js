const { models } = require("../../models/index");

const getAllPostsByUser = async (req, res) => {
  try {
    // Extract userId from query params or route parameters
    const userId = req.params.userId; // or req.params if userId is in URL params

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.Post.findAll({
      where: {
        renter_id: userId, // Filter by userId
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: false,
          where: {
            item_type: "post",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: false,
            },
          ],
        },
        {
          model: models.User,
          as: "renter",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    const formattedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.post_item_name,
        tags: JSON.parse(item.tags),
        createAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "To Rent",
        images: JSON.parse(item.images),
        rentalDates: item.rental_dates.map((date) => ({
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
        renter: {
          id: item.renter_id,
          fname: item.renter.first_name,
          lname: item.renter.last_name,
        },
      };
    });

    // Return the filtered ItemForSale
    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching ItemForSale:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllPostsByUser;
