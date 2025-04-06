const { models } = require("../../models/index");
const Fuse = require("fuse.js");

const getAllAvailablePostUsingQuery = async (req, res) => {
  try {
    // Fetch all approved posts
    const posts = await models.Post.findAll({
      where: { status: "approved" },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          where: {
            status: "available",
            item_type: "post",
            date: {
              [Op.gte]: new Date(), // today's date and future
            },
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              where: { status: "available" },
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

    // if (!posts || posts.length === 0) {
    //   return res.status(404).json({ error: "No approved posts found" });
    // }

    // Format posts before applying Fuse.js search
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      name: post.post_item_name,
      tags: post.tags ? JSON.parse(post.tags) : [],
      createdAt: post.created_at,
      status: post.status,
      category: post.category,
      itemType: "To Rent",
      desc: post.description,
      specs: post.specifications,
      images: post.images ? JSON.parse(post.images) : [],
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

    // Get query parameter
    const { q } = req.query;

    if (q) {
      // Apply Fuse.js fuzzy search
      const fuse = new Fuse(formattedPosts, {
        keys: ["name", "desc", "category", "tags"], // Search in these fields
        threshold: 0.3, // Adjust for fuzziness (0 = strict, 1 = loose)
      });

      const results = fuse.search(q).map((result) => result.item);

      return res.status(200).json(results.length ? results : []);
    }

    res.status(200).json(formattedPosts);
  } catch (error) {
    // console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailablePostUsingQuery;
