const { models } = require("../../models/index");
// Get a single approved post by ID with associated rental dates, durations, and renter info
const getAvailablePostById = async (req, res) => {
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
          include: [
            {
              model: models.Student,
              as: "student",
            },
          ],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found why" });
    }

    // Format the response to flatten fields like item_name, price, etc.
    const formattedPost = {
      id: post.id,
      name: post.post_for_sale_name,
      tags: post.tags,
      price: post.price,
      createdAt: post.created_at,
      status: post.status,
      category: post.category,
      itemType: "To Rent",
      desc: post.description,
      specs: post.specifications,
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
      renterId: post.renter_id,
      renterFname: post.renter.first_name,
      renterLname: post.renter.last_name,
      college: post.category,
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailablePostById;
