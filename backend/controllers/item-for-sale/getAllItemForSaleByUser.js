const { models } = require("../../models/index");

const getAllItemForSaleByUser = async (req, res) => {
  try {
    // Extract userId from query params or route parameters
    const userId = req.params.id; // or req.params if userId is in URL params

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.ItemForSale.findAll({
      where: {
        seller_id: userId, // Filter by userId
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: false,
          where: {
            item_type: "item_for_sale",
            status: "available",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: false,
              where: { status: "available" },
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    const formattedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.item_for_sale_name,
        tags: JSON.parse(item.tags),
        price: item.price,
        createAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "For Sale",
        location: item.location,
        images: JSON.parse(item.images),
        availableDates: item.available_dates.map((date) => ({
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
        seller: {
          id: item.seller,
          fname: item.seller.first_name,
          lname: item.seller.last_name,
        },
      };
    });

    // Return the filtered ItemForSale
    res.status(200).json(formattedItems);
  } catch (error) {
    // console.error("Error fetching ItemForSale:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllItemForSaleByUser;
