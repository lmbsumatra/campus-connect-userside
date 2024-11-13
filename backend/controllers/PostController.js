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

// Get a single approved post by ID with associated rental dates, durations, and renter info
exports.getAvailablePostById = async (req, res) => {
  try {
    const post = await models.Post.findOne({
      where: {
        id: req.params.id,
        status: "approved", // Ensures only "approved" items are fetched
      },
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          where: {
            status: "available", // Ensures only "available" rental dates are included
          },
          include: [
            {
              model: models.RentalDuration,
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

// Get all approved posts for a specific user (by userId)
exports.getAvailablePostsByUser = async (req, res) => {
  console.log("userId", req.query)
  try {
    // Extract userId from query params or route parameters
    const { userId } = req.query; // or req.params if userId is in URL params
   
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const posts = await models.Post.findAll({
      where: {
        status: "approved",
        renter_id: userId, // Filter by userId
      },
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          required: false,
          where: {
            item_type: "item-for-sale",
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

    // Return the filtered listings
    res.status(200).json(posts);
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
  const rentalDates = req.body.rental_dates || [];  // Default to an empty array if no rental_dates are provided

  console.log("Rental Dates received:", rentalDates);  // Log the entire rental_dates object to debug input data

  const transaction = await sequelize.transaction();

  try {
    // Validate the post data
    if (!req.body.post) {
      throw new Error("Post data is missing");
    }

    req.body.post.status = "pending"; // Initially setting the post status to "pending"
    const createdPost = await models.Post.create(req.body.post, { transaction });

    // Process rental dates if provided
    for (const date of rentalDates) {
      if (!date || !date.date) {
        throw new Error("Rental date is missing or invalid");
      }

      console.log("Processing rental date:", date.date);  // Log each rental date being processed

      const rentalDate = await models.RentalDate.create(
        {
          item_id: createdPost.id,
          date: date.date,
          item_type: "post",
        },
        { transaction }
      );

      // Handle rental times if provided
      if (date.times && Array.isArray(date.times)) {
        for (const time of date.times) {
          if (!time.from || !time.to) {
            throw new Error("Rental time is missing 'from' or 'to' fields");
          }

          await models.RentalDuration.create(
            {
              date_id: rentalDate.id,
              rental_time_from: time.from,
              rental_time_to: time.to,
            },
            { transaction }
          );
        }
      } else {
        console.warn(`No rental times provided for date: ${date.date}`);  // Warn if times are not provided
      }
    }

    // Commit the transaction after all rental dates are processed
    await transaction.commit();

    // Fetch renter info
    const renter = await models.User.findOne({
      where: { user_id: req.body.post.renter_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const renterName = renter ? `${renter.first_name} ${renter.last_name}` : "Unknown";


    // Respond with the created post
    res.status(201).json(createdPost);

        // Create notification object
        const notificationData = {
          type: "new-post",
          title: "New Post awaiting approval",
          message: ` is looking for "${createdPost.post_item_name}"`,
          timestamp: new Date(),
          postId: createdPost.id,
          category: createdPost.category,
          renter: {
            id: renter.user_id,
            name: renterName,
          },
        };
    
        // Notify admins using socket (Assuming `req.notifyAdmins` is defined elsewhere in the code)
        req.notifyAdmins(notificationData);
    

  } catch (error) {
    // Rollback transaction in case of error
    if (transaction.finished !== 'commit') {
      await transaction.rollback();
    }

    console.error("Error creating post:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details: "Failed to create post. Please check the input data and try again.",
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
