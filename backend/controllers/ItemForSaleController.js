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
  console.log("userId", req.query)
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

// Create a post
exports.createItemForSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (!req.body.item) {
      throw new Error("Listing data is missing");
    }
    req.body.item.status = "pending";
    const item = await models.ItemForSale.create(req.body.item, {
      transaction,
    });
    console.log("Created item:", item);

    const rentalDates = req.body.rental_dates;

    if (!Array.isArray(rentalDates)) {
      throw new Error("Rental dates should be an array");
    }

    for (const date of rentalDates) {
      if (!date.date) {
        throw new Error("Rental date is missing");
      }

      const rentalDate = await models.Date.create(
        {
          item_id: item.id,
          date: date.date,
          item_type: "item_for_sale",
        },
        { transaction }
      );
      console.log("Created rental date:", rentalDate);

      if (date.times && Array.isArray(date.times)) {
        for (const time of date.times) {
          if (!time.from || !time.to) {
            throw new Error("Rental time is missing from or to fields");
          }

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
        console.warn(`No times provided for date: ${date.date}`);
      }
    }

    await transaction.commit();
    // Fetch the owner's name using the owner_id from the listing
    const seller = await models.User.findOne({
      where: { user_id: req.body.item.seller_id },
      // attributes: ["user_id", "first_name", "last_name"],
    });

    console.log(seller);

    // Notification after successful commit
    const notification = {
      type: "new-listing",
      title: "New Listing Created",
      message: `created new listing "${item.item_for_sale_name}"`,
      timestamp: new Date(),
      listingId: item.id,
      category: item.category,
      owner: {
        id: seller.user_id, // Use user_id here
        name: `${seller.first_name} ${seller.last_name}` || "Unknown",
      },
    };

    console.log(notification);

    // Call the notifyAdmins function from socket.js
    req.notifyAdmins(notification);
    res.status(201).json(item);
  } catch (error) {
    await transaction.rollback();

    console.error("Error creating listing:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details:
        "Failed to create listing. Please check the input data and try again.",
    });
  }
};

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
        item_type: "item_for_sale",  // Filter for listings only
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
