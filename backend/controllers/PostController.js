const Post = require("../models/post/PostModel");
const PostRequestDate = require("../models/post/PostRequestDate");
const PostRequestDuration = require("../models/post/PostRequestDuration");
const sequelize = require("../config/database");
const { models } = require('../models/index');

// Get all posts with rental dates and durations
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await models.Post.findAll({
      attributes: ['id', 'post_item_name', 'tags'],
      include: [
        {
          model: models.PostRequestDate,
          as: "rental_dates", 
          required: false, 
          include: [
            {
              model: models.PostRequestDuration,
              as: "durations", 
              required: false, 
            },
          ],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  const transaction = await sequelize.transaction(); 

  try {
    // Create the listing
    const post = await models.Post.create(req.body.post, { transaction });
    console.log(post);

    // Handle rental dates
    const rentalDates = req.body.rental_dates; 
    for (const date of rentalDates) {
      // console.log("Processing rental date:", date);

      if (!date.date) { 
        throw new Error("Rental date is missing");
      }

      const rentalDate = await models.PostRequestDate.create(
        {
          post_id: post.id,
          rental_date: date.date, 
        },
        { transaction }
      );

      if (date.times) { 
        for (const time of date.times) {
          await models.PostRequestDuration.create(
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

// Get a single listing by ID with associated rental dates, durations, and owner info
exports.getPostById = async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id, {
      include: [
        {
          model: models.PostRequestDate,
          as: 'rental_dates',
          include: [
            {
              model: models.PostRequestDuration,
              as: 'durations',
            },
          ],
        },
        {
          model: models.User, 
          as: 'renter', 
          include: [
            {
              model: models.Student,
              as: 'student', 
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

// Delete a lpost
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
