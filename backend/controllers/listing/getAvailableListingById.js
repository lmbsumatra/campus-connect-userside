const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");

// Get a single approved listing by ID with associated rental dates, durations, renter info, and average rating
const getAvailableListingById = async (req, res) => {
  const userId = req.query.userId || "";

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
        {
          model: models.ReviewAndRate,
          as: "reviews",
          where: { review_type: "item" },
          attributes: ["rate"],
          required: false,
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

    let isFollowingRenter = false;

    if (userId) {
      // Only run this section if user is logged in
      const followings = await models.Follow.findAll({
        where: { follower_id: userId },
        attributes: ["followee_id"],
        raw: true,
      });

      const followingIds = followings.map((follow) => follow.followee_id);

      const transaction = await models.RentalTransaction.findOne({
        where: {
          renter_id: { [Op.in]: followingIds },
          item_id: listing.id,
        },
      });

      isFollowingRenter = !!transaction;
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
      averageRating, // Adding average rating to the response
      isFollowingRenter,
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
        rating: averageOwnerRating,
        profilePic: listing.owner.student.profile_pic,
      },
    };

    res.status(200).json(formattedListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableListingById;
