const { models } = require("../../models/index");

// Get a single approved post by ID with associated rental dates, durations, and renter info
const getAllAvailablePost = async (req, res) => {
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

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailablePost;
