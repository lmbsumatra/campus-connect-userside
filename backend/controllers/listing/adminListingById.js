const { models } = require("../../models/index");

const adminListingById = async (req, res) => {
  try {
    const listing = await models.Listing.findByPk(req.params.id, {
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          include: [
            {
              model: models.Duration,
              as: "durations",
            },
          ],
        },
        {
          model: models.User,
          as: "owner",
          include: [
            {
              model: models.Student,
              as: "student",
            },
          ],
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const formattedListing = {
      id: listing.id,
      itemName: listing.listing_name,
      images: JSON.parse(listing.images),
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
      statusMsg: listing.status_message,
      category: listing.category,
      itemType: "For Rent",
      desc: listing.description,
      specs: listing.specifications,
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
        email: listing.owner.email, // Admin-specific field
        phone: listing.owner.phone, // Admin-specific field
        college: listing.owner.student?.college || "N/A",
      },
    };

    res.status(200).json(formattedListing);
  } catch (error) {
    // console.error("Error fetching admin listing:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = adminListingById;
