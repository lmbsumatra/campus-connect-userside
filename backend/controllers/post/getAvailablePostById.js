const { Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");

// Get a single approved post by ID with associated available rental dates, available durations, and renter info
const getAvailablePostById = async (req, res) => {
  // console.log(req.params.id);
  try {
    const post = await models.Post.findOne({
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
            item_type: "post",
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
          as: "renter",
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

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Get the average rating for this user from all reviews where they were the reviewee
    const userRating = await models.ReviewAndRate.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rate")), "averageRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
      ],
      where: {
        reviewee_id: post.renter.user_id,
        review_type: { [Op.in]: ["owner", "renter"] },
      },
      raw: true,
    });

    // Format the rating to one decimal place if it exists
    const averageRenterRating = userRating?.averageRating
      ? parseFloat(userRating.averageRating).toFixed(1)
      : "0.0";
    // Format the response to flatten fields like item_name, price, etc.
    const formattedPost = {
      id: post.id,
      name: post.post_item_name,
      tags: JSON.parse(post.tags),
      price: post.price,
      createdAt: post.created_at,
      status: post.status,
      category: post.category,
      itemType: post.post_type,
      desc: post.description,
      specs: post.specifications,
      images: JSON.parse(post.images),
      rentalDates: post.rental_dates.map((date) => ({
        id: date.id,
        postId: date.post_id,
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
      renter: {
        id: post.user_id,
        fname: post.renter.first_name,
        lname: post.renter.last_name,
        college: post.renter.student.college,
        rating: averageRenterRating,
      },
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    // console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailablePostById;
