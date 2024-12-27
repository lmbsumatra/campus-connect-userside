const Listing = require("../models/listing/ListingModel");
const sequelize = require("../config/database");
const { models } = require("../models/index");

// // Get all posts with rental dates and durations
// exports.getAllAvailableItemForSale = async (req, res) => {
//   try {
//     const items = await models.ItemForSale.findAll({
//       attributes: [
//         "id",
//         "item_for_sale_name",
//         "tags",
//         "price",
//         "seller_id",
//         "created_at",
//         "status",
//         "category",
//       ],
//       where: {
//         status: "approved",
//       },
//       include: [
//         {
//           model: models.Date,
//           as: "available_dates",
//           required: true,
//           where: {
//             item_type: "item_for_sale",
//           },
//           include: [
//             {
//               model: models.Duration,
//               as: "durations",
//               required: true,
//             },
//           ],
//         },
//         {
//           model: models.User,
//           as: "seller",
//           attributes: ["first_name", "last_name"],
//         },
//       ],
//     });

//     res.status(200).json(items);
//     // console.log(JSON.stringify(listings, null, 2)); // Log for debugging
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Get a single approved item by ID with associated rental dates, durations, and renter info
// exports.getAvailableItemForSaleById = async (req, res) => {
//   try {
//     const item = await models.ItemForSale.findOne({
//       where: {
//         id: req.params.id,
//         status: "approved", // Ensures only "approved" items are fetched
//       },
//       include: [
//         {
//           model: models.Date,
//           as: "available_dates",
//           where: {
//             status: "available", // Ensures only "available" rental dates are included
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
//           as: "seller",
//           include: [
//             {
//               model: models.Student,
//               as: "student",
//             },
//           ],
//         },
//       ],
//     });

//     if (!item) {
//       return res.status(404).json({ error: "Item not found why" });
//     }

//     res.status(200).json(item);
//   } catch (error) {
//     console.error("Error fetching item:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Get all approved posts for a specific user (by userId)
exports.getAvailableItemsForSaleByUser = async (req, res) => {
  console.log("userId", req.query);
  try {
    // Extract userId from query params or route parameters
    const { userId } = req.query; // or req.params if userId is in URL params

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.ItemForSale.findAll({
      where: {
        status: "approved",
        seller_id: userId, // Filter by userId
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: false,
          where: {
            item_type: "item-for-sale",
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
          as: "seller",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    // Return the filtered listings
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllItemForSale = async (req, res) => {
  try {
    const items = await models.ItemForSale.findAll({
      attributes: [
        "id",
        "item_for_sale_name",
        "tags",
        "price",
        "seller_id",
        "created_at",
        "status",
        "category",
      ],
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: false,
          where: {
            item_type: "item_for_sale",
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
          as: "seller",
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


// exports.createItemForSale = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     // Ensure item details exist in the request
//     if (!req.body.item) {
//       throw new Error("Listing data is missing");
//     }

//     const {
//       sellerId,
//       category,
//       itemName,
//       itemCondition,
//       paymentMethod,
//       price,
//       desc,
//       tags,
//       dates,
//       specs,
//     } = req.body.item;

//     // Validate required fields
//     if (!sellerId || !itemName || !itemCondition || !paymentMethod || !price) {
//       throw new Error("Required fields missing");
//     }

//     // Process uploaded files (item images)
//     const uploadedFiles = req.files?.item_images || [];
//     const imageUrls = uploadedFiles.map((file) => file.path); // Extract URLs from Cloudinary

//     // Create the item for sale
//     const item = await models.ItemForSale.create(
//       {
//         seller_id: sellerId,
//         category,
//         item_for_sale_name: itemName,
//         item_condition: itemCondition,
//         payment_mode: paymentMethod,
//         price,
//         images: JSON.stringify(imageUrls), // Store image URLs as JSON string
//         description: desc,
//         tags: JSON.stringify(tags), // Convert tags array to JSON
//         status: "pending",
//         specifications: specs,
//       },
//       { transaction }
//     );

//     // Handle rental dates and time periods
//     if (Array.isArray(dates)) {
//       for (const dateEntry of dates) {
//         const { date, timePeriods } = dateEntry;

//         // Create a Date record
//         const rentalDate = await models.Date.create(
//           {
//             item_id: item.id,
//             date: date, // ISO date format
//             item_type: "item_for_sale",
//           },
//           { transaction }
//         );

//         // Create Duration records for each time period
//         if (Array.isArray(timePeriods)) {
//           for (const period of timePeriods) {
//             const { startTime, endTime } = period;

//             if (!startTime || !endTime) {
//               throw new Error(
//                 "Both 'from' and 'to' times are required in timePeriods."
//               );
//             }

//             await models.Duration.create(
//               {
//                 date_id: rentalDate.id,
//                 rental_time_from: startTime,
//                 rental_time_to: endTime,
//               },
//               { transaction }
//             );
//           }
//         }
//       }
//     } else {
//       throw new Error("Dates must be provided as an array.");
//     }

//     // Commit transaction
//     await transaction.commit();

//     res
//       .status(201)
//       .json({ message: "Item for sale created successfully.", item });
//   } catch (error) {
//     await transaction.rollback();

//     // Rollback uploaded images in case of error
//     if (req.files?.item_images) {
//       const publicIds = req.files.item_images.map((file) => file.filename);
//       await rollbackUpload(publicIds);
//     }

//     console.error("Error creating item for sale:", error);
//     res.status(500).json({
//       error: "Internal Server Error",
//       message: error.message,
//       details:
//         "Failed to create listing. Please check the input data and try again.",
//     });
//   }
// };


// Get a single post by ID with associated rental dates, durations, and renter info
exports.getItemForSaleById = async (req, res) => {
  try {
    const post = await models.ItemForSale.findByPk(req.params.id, {
      include: [
        {
          model: models.Date,
          as: "available_dates",
          include: [
            {
              model: models.Duration,
              as: "durations",
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          include: [
            {
              model: models.Student,
              as: "student",
            },
          ],
        },
      ],
      where: {
        // Assuming you have a column 'item_type' in your Listing model
        item_type: "item_for_sale", // Filter for listings only
      },
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
exports.updateItemForSale = async (req, res) => {
  try {
    const item = await models.ItemForSale.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    await post.update(req.body);
    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a post
exports.deleteItemForSale = async (req, res) => {
  try {
    const item = await Listing.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    await item.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  console.log(req.body);
  const { status } = req.body;

  try {
    const item_for_sale = await models.ItemForSale.findByPk(req.params.id);
    if (!item_for_sale) {
      return res.status(404).json({ error: "Listing not found" });
    }

    item_for_sale.status = status;
    await item_for_sale.save();

    res.status(200).json(item_for_sale);
  } catch (error) {
    console.error("Error updating listing status:", error);
    res.status(500).json({ error: error.message });
  }
};
