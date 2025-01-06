const { models } = require("../../models/index");

// Get a single approved post by ID with associated rental dates, durations, and renter info
const getAllAvailablePost = async (req, res) => {
  try {
    const posts = await models.Post.findAll({
      where: {
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

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "No approved posts found" });
    }

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      name: post.post_item_name,
      tags: post.tags ? JSON.parse(post.tags) : [], // Safely parse or use default
      createdAt: post.created_at,
      status: post.status,
      category: post.category,
      itemType: "To Rent",
      desc: post.description,
      specs: post.specifications,
      images: post.images ? JSON.parse(post.images) : [], // Safely parse or use default
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
        id: post.renter?.user_id || null,
        fname: post.renter?.first_name || "",
        lname: post.renter?.last_name || "",
        college: post.renter?.student?.college || "",
      },
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailablePost;
