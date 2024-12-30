const { models } = require("../../models/index");

const getListingById = async (req, res) => {
  try {
    const listing = await models.Listing.findByPk(req.params.listingId, {
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
      where: {
        // Assuming you have a column 'item_type' in your Listing model
        item_type: "listing", // Filter for listings only
      },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Format the response to flatten fields like item_name, price, etc.
    const formattedListing = {
      id: listing.id,
      itemName: listing.listing_name,
      images: JSON.parse(listing.images),
      tags: JSON.parse(listing.tags),
      price: listing.rate,
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
      specs: JSON.parse(listing.specifications),
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
    console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getListingById;
