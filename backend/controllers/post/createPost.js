const { models } = require("../../models");
const sequelize = require("../../config/database");

const validatePostData = (postData) => {
  const requiredFields = ["renterId", "itemName", "category", "desc"];
  const missingFields = requiredFields.filter((field) => !postData[field]);

  if (missingFields.length) {
    throw new Error(`Required fields missing: ${missingFields.join(", ")}`);
  }
};

const validateImages = (files) => {
  if (!files?.length) {
    throw new Error("At least one image must be uploaded.");
  }

  // Return the local file paths for the images
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
      // If using a cloud service like Cloudinary, delete the file there
      console.log(`Rolling back file: ${file}`);
      // Example: fs.unlinkSync(file); // Uncomment for local storage rollback
    }
  } catch (err) {
    console.error("Error during image rollback:", err);
  }
};

const createPost = async (req, res) => {
    const transaction = await sequelize.transaction();
  
    try {
      console.log("Received POST data:", req.body.post);
      console.log("Received Files:", req.files);
  
      const postData =
        typeof req.body.post === "string"
          ? JSON.parse(req.body.post)
          : req.body.post;
  
      console.log("Parsed Post Data:", postData);
  
      if (!postData) {
        throw new Error("Post data is missing");
      }
  
      // Validate post data and images
      validatePostData(postData);
  
      const imagePaths = validateImages(req.files.upload_images);
      console.log("Uploaded Images Paths:", imagePaths);
  
      // Validate rental dates if present
      if (Array.isArray(postData.dates)) {
        console.log("Rental Dates:", postData.dates);
        validateRentalDates(postData.dates);
      }
  
      // Create the post
      console.log("Creating Post Data:", {
        post_item_name: postData.itemName,
        renter_id: postData.renterId,
        category: postData.category,
        title: postData.itemName,
        description: postData.desc,
        tags: postData.tags,
        status: "pending",
        specifications: postData.specs,
        images: JSON.stringify(imagePaths),
      });
  
      const post = await models.Post.create(
        {
          post_item_name: postData.itemName,
          renter_id: postData.renterId,
          category: postData.category,
          title: postData.itemName,
          description: postData.desc,
          tags: postData.tags,
          status: "pending",
          specifications: postData.specs,
          images: JSON.stringify(imagePaths),
        },
        { transaction }
      );
  
      console.log("Post Created:", post);
  
      // Process rental dates (if any)
      if (Array.isArray(postData.dates)) {
        for (const { date, durations } of postData.dates) {
          console.log("Processing Date:", date);
          console.log("Processing Durations:", durations);
  
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
  
      // Commit transaction
      await transaction.commit();
      res.status(201).json({ message: "Post created successfully.", post });
    } catch (error) {
      console.error("Error creating post:", error);
  
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
