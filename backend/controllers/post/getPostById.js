const { models } = require("../../models/index");

const getPostById = async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.postId, {
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          where: {
            item_type: "post",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
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
      //   where: {
      //     // Assuming you have a column 'item_type' in your Item model
      //     post_type: "item_for_sale", // Filter for item for sale only
      //   },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Format the response to flatten fields like item_name, price, etc.
    const formattedPost = {
      id: post.id,
      itemName: post.post_item_name,
      images: JSON.parse(post.images),
      tags: JSON.parse(post.tags),
      createdAt: post.created_at,
      category: post.category,
      itemType: post.post_type,
      desc: post.description,
      status: post.status,
      statusMessage: post.status_message,
      specs: JSON.parse(post.specifications),
      requestDates: post.rental_dates.map((date) => ({
        id: date.id,
        itemId: date.item_id,
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
        id: post.renter.user_id,
        fname: post.renter.first_name,
        lname: post.renter.last_name,
        college: post.renter.student.college,
      },
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    // console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getPostById;
