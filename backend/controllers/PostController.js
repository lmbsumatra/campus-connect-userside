const Post = require("../models/post/PostModel");
const sequelize = require("../config/database");
const { models } = require("../models/index");


exports.getAllApprovedPost = async (req, res) => {
  try {
    const items = await models.Post.findAll({
     
      where: {
        status: "approved",
      },
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          required: false,
          where: {
            item_type: "post",
          },
          include: [
            {
              model: models.RentalDuration,
              as: "durations",
              required: false,
            },
          ],
        },
        {
          model: models.User,
          as: "renter",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    res.status(200).json(items);
    // console.log(JSON.stringify(listings, null, 2)); // Log for debugging
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get all posts with rental dates and durations
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await models.Post.findAll({
      attributes: ["id", "post_item_name", "tags", "renter_id", "category", "created_at", "status"],
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          required: false,
          include: [
            {
              model: models.RentalDuration,
              as: "durations",
              required: false,
            },
          ],
        },
        {
          model: models.User,
          as: "renter",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a post
exports.createPost = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    req.body.post.status = "pending";
    const post = await models.Post.create(req.body.post, { transaction });

    const rentalDates = req.body.rental_dates;
    for (const date of rentalDates) {
      if (!date.date) {
        throw new Error("Rental date is missing");
      }

      const rentalDate = await models.RentalDate.create(
        {
          item_id: post.id,
          date: date.date,
          item_type: "post",
        },
        { transaction }
      );

      if (date.times) {
        for (const time of date.times) {
          await models.RentalDuration.create(
            {
              date_id: rentalDate.id,
              rental_time_from: time.from,
              rental_time_to: time.to,
            },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();
    res.status(201).json(post);
  } catch (error) {
    await transaction.rollback();

    console.error("Error creating post:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details:
        "Failed to create post. Please check the input data and try again.",
    });
  }
};

// Get a single post by ID with associated rental dates, durations, and renter info
exports.getPostById = async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id, {
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          include: [
            {
              model: models.RentalDuration,
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
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    await post.update(req.body);
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    await post.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update the status of a listing
exports.updateStatus = async (req, res) => {
  console.log(req.body)
  const { status } = req.body; 

  try {
    const post = await models.Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Listing not found" });
    }

    post.status = status;
    await post.save(); 

    res.status(200).json(post); 
  } catch (error) {
    console.error("Error updating listing status:", error);
    res.status(500).json({ error: error.message });
  }
};
