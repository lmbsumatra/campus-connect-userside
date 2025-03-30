const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");

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
        {
          model: models.ReviewAndRate,
          as: "reviews",
          where: { review_type: "item" },
          attributes: ["rate"],
          required: false, // Allow fetching listings without reviews
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Calculate average rating
    const reviews = listing.reviews || [];
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
      : null;

    // Get the average rating for this user from all reviews where they were the reviewee
    const userRating = await models.ReviewAndRate.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rate")), "averageRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
      ],
      where: {
        reviewee_id: listing.owner.user_id,
        review_type: { [Op.in]: ["owner", "renter"] },
      },
      raw: true,
    });

    // Format the rating to one decimal place if it exists
    const averageOwnerRating = userRating?.averageRating
      ? parseFloat(userRating.averageRating).toFixed(1)
      : "0.0";

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
      location: listing.location,
      averageRating, // Including average rating in the response
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
        email: listing.owner.email,
        phone: listing.owner.phone,
        college: listing.owner.student?.college || "N/A",
        rating: averageOwnerRating,
        profilePic: listing.owner.student.profile_pic,
      },
    };

    res.status(200).json(formattedListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = adminListingById;
