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
            item_type: "listing",
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
          as: "seller",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    // Format the items for response
    const formattedItems = items.map((item) => {
      try {
        // Safely parse JSON fields and provide defaults if invalid
        const parsedTags = item.tags ? JSON.parse(item.tags) : [];
        const parsedImages = item.images ? JSON.parse(item.images) : [];
        
        return {
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
          // Corrected availableDates structure
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
            id: item.seller_id,
            fname: item.seller.first_name,
            lname: item.seller.last_name,
          },
        };
      } catch (error) {
        console.error("Error formatting item:", error);
        return null; // This ensures that a malformed item is skipped
      }
    }).filter(Boolean); // Remove any null items if formatting failed

    // Return the formatted items
    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableItemsForSaleByUser;
