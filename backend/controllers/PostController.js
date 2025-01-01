const Post = require("../models/PostModel");
const sequelize = require("../config/database");
const { models } = require("../models/index");
// const { truncateByDomain } = require("recharts/types/util/ChartUtils");

exports.getAllApprovedPost = async (req, res) => {
  try {
    const items = await models.Post.findAll({
      where: {
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: true,
          where: {
            item_type: "post",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
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
// exports.getAvailablePostById = async (req, res) => {
//   try {
//     const post = await models.Post.findOne({
//       where: {
//         id: req.params.id,
//         status: "approved", // Ensures only "approved" items are fetched
//       },
//       include: [
//         {
//           model: models.Date,
//           as: "rental_dates",
//           where: {
//             status: "available", // Ensures only "available" rental dates are included
//             item_type: "post",
//           },
//           include: [
//             {
//               model: models.Duration,
//               as: "durations",
//               where: {
//                 status: "available", // Ensures only "available" rental durations are included
//               },
//             },
//           ],
//         },
//         {
//           model: models.User,
//           as: "renter",
//           include: [
//             {
//               model: models.Student,
//               as: "student",
//             },
//           ],
//         },
//       ],
//     });

//     if (!post) {
//       return res.status(404).json({ error: "Post not found why" });
//     }

//     res.status(200).json(post);
//   } catch (error) {
//     console.error("Error fetching post:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Get all approved posts for a specific user (by userId)
exports.getAvailablePostsByUser = async (req, res) => {
  console.log("userId", req.query);
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
          model: models.Date,
          as: "rental_dates",
          required: false,
          where: {
            item_type: "post",
          },
          include: [
            {
              model: models.Duration,
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
      attributes: [
        "id",
        "post_item_name",
        "tags",
        "renter_id",
        "category",
        "created_at",
        "status",
      ],
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: false,  // This should be here for LEFT JOIN behavior
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: false,  // Optional inclusion of durations
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
exports.createPost = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    // Check if required post data is provided
    if (!req.body.post) {
      throw new Error("Post data is missing");
    }

    let createdPost;

    // Create the post
    req.body.post.status = "pending";  // Set the post status to "pending" initially
    createdPost = await models.Post.create(req.body.post, { transaction });
    
    // Handle rental dates and durations if provided
    const rentalDates = req.body.rental_dates || [];
    if (Array.isArray(rentalDates)) {
      for (const date of rentalDates) {
        if (!date.date) {
          throw new Error("Rental date is missing");
        }

        // Create rental date associated with the post
        const rentalDate = await models.Date.create(
          {
            item_id: createdPost.id,
            date: date.date,
            item_type: 'post',  // This assumes 'item_type' can be "post" in the rental date
          },
          { transaction }
        );
        console.log("Created rental date:", rentalDate);

        // Handle rental times (if provided)
        if (date.times && Array.isArray(date.times)) {
          for (const time of date.times) {
            if (!time.from || !time.to) {
              throw new Error("Rental time is missing from or to fields");
            }

            // Create rental duration associated with the rental date
            await models.Duration.create(
              {
                date_id: rentalDate.id,
                rental_time_from: time.from,
                rental_time_to: time.to,
              },
              { transaction }
            );
          }
        } else {
          console.warn(`No rental times provided for date: ${date.date}`);
        }
      }
    }

    // Commit the transaction
    await transaction.commit();

    // Fetch the post owner information
    const owner = await models.User.findOne({
      where: { user_id: req.body.post.renter_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : "Unknown";

    // Create notification object
    const notification = {
      type: "new-post",
      title: "New Post Awaiting Approval",
      message: `Created a new post titled "${createdPost.title}"`,
      timestamp: new Date(),
      postId: createdPost.id,
      category: createdPost.category,
      owner: {
        id: owner.user_id,
        name: ownerName,
      }
    };

    // Log the details for debugging
    console.log("CreatedPost:", {
      id: createdPost.id,
      title: createdPost.title,
      category: createdPost.category,
    });
    console.log("Owner:", {
      id: owner.user_id,
      name: ownerName
    });

    // Notify admins via socket
    req.notifyAdmins(notification);  // This triggers the socket event on the backend

    // Return the created post as a response
    res.status(201).json(createdPost);
  } catch (error) {
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
          model: models.Date,
          as: "rental_dates",
          where: {
            item_id: req.params.id, 
            item_type: "post",
            
          },
          required: false,
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
    });

    // Log the rental dates
    // console.log(JSON.stringify(post.rental_dates, null, 2));

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
