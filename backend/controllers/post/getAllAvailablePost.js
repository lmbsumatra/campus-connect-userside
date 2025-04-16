const { Op } = require("sequelize");
const { models } = require("../../models/index");
const Fuse = require("fuse.js");

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
            date: {
              [Op.gte]: new Date(), // today's date and future
            },
          },
          required: true,
          include: [
            {
              model: models.Duration,
              as: "durations",
              where: {
                status: "available", // Ensures only "available" rental durations are included
              },
              required: true,
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
              attributes: ["college"],
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

    const formattedPosts = posts.map((post) => {
      const specsString =
        typeof post.specifications === "object"
          ? JSON.stringify(post.specifications)
          : post.specifications;

      let specsArray = [];

      try {
        const parsedSpecs = JSON.parse(specsString);
        specsArray = Object.values(parsedSpecs).map((val) => String(val));
      } catch (err) {
        specsArray = [];
      }

      return {
        id: post.id,
        name: post.post_item_name,
        tags: post.tags ? JSON.parse(post.tags) : [],
        specs: post.specifications,
        specsArray,
        createdAt: post.created_at,
        status: post.status,
        category: post.category,
        itemType: post.post_type,
        desc: post.description,
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
          id: post.renter?.user_id || null,
          fname: post.renter?.first_name || "",
          lname: post.renter?.last_name || "",
          college: post.renter?.student?.college || "",
        },
        college: post.renter?.student?.college || null,
      };
    });

    const { q, preference } = req.query;

    if (q) {
      let filteredPosts = [...formattedPosts];
      const normalizedQuery = q.toLowerCase();

      const queryKeywords = normalizedQuery.split(" ");

      const refinedKeywords = queryKeywords.filter(
        (keyword) => keyword.trim() !== ""
      );

      if (preference === "new_posts") {
        filteredPosts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      const fuse = new Fuse(formattedPosts, {
        keys: ["name", "desc", "category", "tags", "specsArray"],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });

      const results = fuse
        .search(refinedKeywords.join(" "))
        .map((result) => result.item);
      // console.log({ results });

      return res.status(200).json(results.length ? results : []);
    }

    res.status(200).json(formattedPosts);
  } catch (error) {
    // console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllAvailablePost;
