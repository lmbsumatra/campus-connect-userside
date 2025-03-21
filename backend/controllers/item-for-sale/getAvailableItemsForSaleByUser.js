const { models } = require("../../models");

const getAvailableItemsForSaleByUser = async (req, res) => {
  try {
    // Extract userId from route parameters
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch items from the database
    const items = await models.ItemForSale.findAll({
      where: {
        status: "approved",
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
    });

    // Format the items for response
    const formattedItems = items
      .map((item) => {
        try {
          const parsedTags = item.tags ? JSON.parse(item.tags) : [];
          const parsedImages = item.images ? JSON.parse(item.images) : [];

          // Construct availableDates properly
          const availableDates = item.available_dates.map((date) => ({
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
          }));

          return availableDates.length > 0
            ? {
                id: item.id,
                name: item.item_for_sale_name,
                tags: parsedTags,
                price: parseFloat(item.price),
                createAt: item.created_at,
                status: item.status,
                category: item.category,
                itemType: "For Sale",
                images: parsedImages,
                itemCondition: item.listing_condition,
                deliveryMethod: item.delivery_mode,
                lateCharges: item.late_charges,
                securityDeposit: item.security_deposit,
                repairReplacement: item.repair_replacement,
                paymentMethod: item.payment_mode,
                specs: item.specifications,
                availableDates, // Ensure only items with dates are included
                seller: {
                  id: item.seller_id,
                  fname: item.seller.first_name,
                  lname: item.seller.last_name,
                },
              }
            : null; // Exclude items with no availableDates
        } catch (error) {
          console.error("Error formatting item:", error);
          return null;
        }
      })
      .filter(Boolean); // Remove items that are null (i.e., no dates)

    console.log("getching here?", formattedItems);
    // Return the formatted items
    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableItemsForSaleByUser;
