const { models } = require("../../models/index");
// Get a single approved item by ID with associated rental dates, durations, and renter info
const getAvailableItemForSaleById = async (req, res) => {
  try {
    const item = await models.ItemForSale.findOne({
      where: {
        id: req.params.id,
        status: "approved", // Ensures only "approved" items are fetched
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          where: {
            status: "available", // Ensures only "available" rental dates are included
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              where: {
                status: "available", // Ensures only "available" rental durations are included
              },
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
      return res.status(404).json({ error: "Item not found why" });
    }

    const formattedItem = {
      id: item.id,
      name: item.item_for_sale_name,
      tags: item.tags,
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
      rentalDates: item.available_dates.map((date) => ({
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
        id: item.renter_id,
        fname: item.seller.first_name,
        lname: item.seller.last_name,
        college: item.seller.student.college,
      },
    };

    res.status(200).json(formattedItem);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableItemForSaleById;
