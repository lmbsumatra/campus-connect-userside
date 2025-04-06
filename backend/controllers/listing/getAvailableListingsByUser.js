const { models } = require("../../models");

const getAvailableListingsByUser = async (req, res) => {
  try {
    // Extract userId from query params or route parameters
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.Listing.findAll({
      where: {
        status: "approved",
        owner_id: userId,
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",

          required: true,
          where: {
            item_type: "listing",
            status: "available",
            date: {
              [Op.gte]: new Date(), // today's date and future
            },
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
              where: { status: "available" },
            },
          ],
        },
        {
          model: models.User,
          as: "owner",
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
        {
          model: models.ReviewAndRate,
          as: "reviews",
          where: { review_type: "item" },
          attributes: ["rate"],
          required: false,
        },
      ],
    });

    const formattedItems = items.map((item) => {
      const reviews = item.reviews || [];
      const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
        : null;

      return {
        id: item.id,
        name: item.listing_name,
        tags: JSON.parse(item.tags),
        price: parseFloat(item.rate),
        createAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "For Rent",
        images: JSON.parse(item.images),
        itemCondition: item.listing_condition,
        deliveryMethod: item.delivery_mode,
        lateCharges: item.late_charges,
        securityDeposit: item.security_deposit,
        repairReplacement: item.repair_replacement,
        paymentMethod: item.payment_mode,
        specs: item.specifications,
        location: item.location,
        averageRating, // Adding average rating to the response
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
        owner: {
          id: item.owner_id,
          fname: item.owner.first_name,
          lname: item.owner.last_name,
        },
      };
    });

    res.status(200).json(formattedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableListingsByUser;
