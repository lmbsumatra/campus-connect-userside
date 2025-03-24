const { models } = require("../../models/index");

// Get a single approved listing by ID with associated rental dates, durations, and renter info
const getAvailableListingById = async (req, res) => {
  try {
    const listing = await models.Listing.findOne({
      where: {
        id: req.params.id,
        status: "approved", // Ensures only "approved" items are fetched
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
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
          as: "owner",
          where: {
            email_verified: true,
          },
          include: [
            {
              model: models.Student,
              as: "student",
              where: {
                status: "verified",
              },
            },
          ],
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found why" });
    }

    // Format the response to flatten fields like item_name, price, etc.
    const formattedListing = {
      id: listing.id,
      name: listing.listing_name,
      tags: JSON.parse(listing.tags),
      rate: listing.rate,
      createdAt: listing.created_at,
      deliveryMethod: listing.delivery_mode,
      lateCharges: listing.late_charges,
      securityDeposit: listing.security_deposit,
      repairReplacement: listing.repair_replacement,
      itemCondition: listing.listing_condition,
      paymentMethod: listing.payment_mode,
      status: listing.status,
      category: listing.category,
      itemType: "For Rent",
      desc: listing.description,
      specs: listing.specifications,
      images: JSON.parse(listing.images),
      availableDates: listing.rental_dates.map((date) => ({
        id: date.id,
        listingId: date.listing_id,
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
      owner: {
        id: listing.owner.user_id,
        fname: listing.owner.first_name,
        lname: listing.owner.last_name,
        college: listing.owner.student.college,
      },
    };

    res.status(200).json(formattedListing);
  } catch (error) {
    // console.error("Error fetching listing:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableListingById;
