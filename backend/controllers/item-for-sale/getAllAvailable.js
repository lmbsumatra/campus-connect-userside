// controllers/for-sale.js
const { models } = require("../../models/index");
const sequelize = require("../../config/database");

const getAllAvailable = async (req, res) => {
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
      ],
      where: {
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: true,
          where: {
            item_type: "item_for_sale",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
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

    // Format the response to flatten fields like item_name, price, etc.
    const formattedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.item_for_sale_name,
        tags: JSON.parse(item.tags),
        price: item.price,
        createdAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "For Sale",
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
        sellerId: item.seller_id,
        sellerFname: item.seller.first_name,
        sellerLname: item.seller.last_name,
      };
    });

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
