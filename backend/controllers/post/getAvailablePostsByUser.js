const { models } = require("../../models");

const getAvailableListingsByUser = async (req, res) => {
  try {
    // Extract userId from query params or route parameters
    const { userId } = req.params; // or req.params if userId is in URL params

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.Post.findAll({
      where: {
        status: "approved",
        user_id: userId, // Filter by userId
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: true,
          where: {
            item_type: "post",
            date: {
              [Op.gte]: new Date(), // today's date and future
            },
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
          as: "renter",
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

    const formattedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.post_item_name,
        tags: JSON.parse(item.tags),
        price: parseFloat(item.rate),
        createAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "To Rent",
        images: JSON.parse(item.images),
        itemCondition: item.listing_condition,
        deliveryMethod: item.delivery_mode,
        lateCharges: item.late_charges,
        securityDeposit: item.security_deposit,
        repairReplacement: item.repair_replacement,
        itemCondition: item.listing_condition,
        paymentMethod: item.payment_mode,
        specs: item.specifications,
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
          id: item.user_id,
          fname: item.renter.first_name,
          lname: item.renter.last_name,
        },
      };
    });

    // Return the filtered listings
    res.status(200).json(formattedItems);
  } catch (error) {
    // console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableListingsByUser;
