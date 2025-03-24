const { models } = require("../../models/index");

const adminItemForSaleById = async (req, res) => {
  try {
    const item = await models.ItemForSale.findByPk(req.params.id, {
      include: [
        {
          model: models.Date,
          as: "available_dates",
          where: {
            item_type: "item_for_sale",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          include: [
            {
              model: models.Student,
              as: "student",
            },
          ],
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Format the response to flatten fields like item_name, price, etc.
    const formattedItem = {
      id: item.id,
      itemName: item.item_for_sale_name,
      images: JSON.parse(item.images),
      tags: JSON.parse(item.tags),
      price: item.price,
      createdAt: item.created_at,
      deliveryMethod: item.delivery_mode,
      itemCondition: item.item_condition,
      paymentMethod: item.payment_mode,
      status: item.status,
      category: item.category,
      itemType: "For Sale",
      desc: item.description,
      specs: item.specifications,
      availableDates: item.available_dates.map((date) => ({
        id: date.id,
        itemId: date.item_id,
        date: date.date,
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
        id: item.seller.user_id,
        fname: item.seller.first_name,
        lname: item.seller.last_name,
        college: item.seller.student.college,
      },
    };
    res.status(200).json(formattedItem);
  } catch (error) {
    // console.error("Error fetching admin listing:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = adminItemForSaleById;
