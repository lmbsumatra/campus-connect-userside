const { models } = require("../../models");
const sequelize = require("../../config/database");

const validatePostData = (postData) => {
  const requiredFields = ["userId", "itemName", "category", "desc"];
  const missingFields = requiredFields.filter((field) => !postData[field]);

  if (missingFields.length) {
    throw new Error(`Required fields missing: ${missingFields.join(", ")}`);
  }
};

const validateImages = (files) => {
  if (!files?.length) {
    throw new Error("At least one image must be uploaded.");
  }

  return files.map((file) => file.path);
};

const validateRentalDates = (rentalDates) => {
  if (!Array.isArray(rentalDates)) {
    throw new Error("Rental dates should be an array.");
  }

  rentalDates.forEach(({ date, durations }) => {
    if (!date) {
      throw new Error("Each rental date must have a valid date.");
    }

    if (!Array.isArray(durations)) {
      throw new Error("Rental durations should be an array.");
    }

    durations.forEach((time) => {
      if (!time.timeFrom || !time.timeTo) {
        throw new Error(
          "Both start and end durations are required for each rental time period."
        );
      }
    });
  });
};

const rollbackUpload = async (files) => {
  try {
    for (const file of files) {
      // console.log(`Rolling back file: ${file}`);
    }
  } catch (err) {
    // console.error("Error during image rollback:", err);
  }
};

const createPost = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // console.log("Received POST data:", req.body.post);
    // console.log("Received Files:", req.files);

    const postData =
      typeof req.body.post === "string" ? JSON.parse(req.body.post) : req.body.post;

    // console.log("Parsed Post Data:", postData);

    if (!postData) {
      throw new Error("Post data is missing");
    }

    // Validate post data and images
    validatePostData(postData);

    const imagePaths = validateImages(req.files.upload_images);
    // console.log("Uploaded Images Paths:", imagePaths);

    // Validate rental dates if present
    if (Array.isArray(postData.dates)) {
      // console.log("Rental Dates:", postData.dates);
      validateRentalDates(postData.dates);
    }

    // Create the post
    const post = await models.Post.create(
      {
        post_item_name: postData.itemName,
        user_id: postData.userId,
        category: postData.category,
        title: postData.itemName,
        description: postData.desc,
        tags: postData.tags,
        status: "pending",
        specifications: postData.specs,
        images: JSON.stringify(imagePaths),
        post_type: postData.post_type,
      },
      { transaction }
    );

    // console.log("Post Created:", post);

    // Process rental dates (if any)
    if (Array.isArray(postData.dates)) {
      for (const { date, durations } of postData.dates) {
        const rentalDate = await models.Date.create(
          {
            item_id: post.id,
            date,
            item_type: "post",
          },
          { transaction }
        );

        await Promise.all(
          durations.map((time) =>
            models.Duration.create(
              {
                date_id: rentalDate.id,
                rental_time_from: time.timeFrom,
                rental_time_to: time.timeTo,
              },
              { transaction }
            )
          )
        );
      }
    }

    // Fetch renter details (owner of the post)
    const renter = await models.User.findOne({
      where: { user_id: post.user_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const ownerName = renter
      ? `${renter.first_name} ${renter.last_name}`
      : "Unknown";

    // Create notification data
    const notificationData = {
      type: "new-post", // You can adjust this based on different types
      title: "New Post Awaiting Approval",
      message: ` posted an item: "${post.post_item_name}"`,
      ownerName,
      ownerId: renter?.user_id,
      itemId: post.id,
      itemType: "post", // Item type is "post" as per your table
      timestamp: new Date(), // Timestamp will be automatically set to the current date if not provided
      isRead: false, // Set the notification as unread initially
    };

    // Store notification in the database
    const notification = await models.Notification.create(notificationData, { transaction });

    // Commit transaction
    await transaction.commit();

    // Emit socket event after commit
    if (req.notifyAdmins) {
      req.notifyAdmins({
        ...notification.toJSON(),
        owner: {
          id: renter.user_id,
          name: ownerName,
        },
      });
    }

    // Respond with success
    res.status(201).json({
      message: "Post created successfully.",
      post,
      notification: notification.toJSON(),
    });
  } catch (error) {
    // console.error("Error creating post:", error);

    // Rollback transaction
    await transaction.rollback();

    // Rollback uploaded files
    if (req.files?.upload_images?.length) {
      const filePaths = req.files.upload_images.map((file) => file.path);
      await rollbackUpload(filePaths);
    }

    // Send error response
    res.status(400).json({
      error: "Validation Error",
      message: error.message,
    });
  }
};


module.exports = createPost;
