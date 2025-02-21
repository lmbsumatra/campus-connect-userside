const { models } = require("../../models/index");
const sequelize = require("../../config/database");
const Fuse = require("fuse.js");

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
          where: { item_type: "item_for_sale" },
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
          include: [
            { model: models.Student, as: "student", attributes: ["college"] },
          ],
        },
      ],
    });

    // Format the response
    const formattedItems = items.map((item) => {
      let tags = [];
      let images = [];

      try {
        tags = JSON.parse(item.tags);
      } catch (error) {
        console.warn(`Failed to parse tags for item ${item.id}`);
      }

      try {
        images = JSON.parse(item.images);
      } catch (error) {
        console.warn(`Failed to parse images for item ${item.id}`);
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
        availableDates: item.available_dates.map((date) => ({
          id: date.id,
          itemId: date.item_id,
          date: date.date,
          itemType: date.item_type,
          status: date.status,
          durations: date.durations.map((duration) => ({
            id: duration.id,
            dateId: date.id, // Ensuring correct reference
            timeFrom: duration.rental_time_from,
            timeTo: duration.rental_time_to,
            status: duration.status,
          })),
        })),
        sellerId: item.seller_id,
        sellerFname: item.seller.first_name,
        sellerLname: item.seller.last_name,
        college: item.seller.student ? item.seller.student.college : null, // Fixing the college reference
      };
    });

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
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailable;
