const Listing = require("../models/listing/ListingModel");
const sequelize = require("../config/database");
const { models } = require("../models/index");
const {notifyAdmins} = require('../socket.js')

// Get all approved listing: displayed in home, listings page
exports.getAllAvailableListing = async (req, res) => {
  try {
    // Fetch all approved listings
    const items = await models.Listing.findAll({
      where: {
        status: "approved", // Filter for approved items
      },
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          required: false,
          where: {
            item_type: "listing",
            status: "available", // Filter for available dates
          },
          include: [
            {
              model: models.RentalDuration,
              as: "durations",
              required: false,
              where: {
                status: "available", // Filter for available durations
              },
            },
          ],
        },
        {
          model: models.User,
          as: "owner",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single approved listing by ID with associated rental dates, durations, and renter info
exports.getAvailableListingById = async (req, res) => {
  try {
    const listing = await models.Listing.findOne({
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
          as: "owner",
          include: [
            {
              model: models.Student,
              as: "student",
            },
          ],
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found why" });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all approved listings for a specific user (by userId): kapag profile visit ganern
exports.getAvailableListingsByUser = async (req, res) => {
  try {
    // Extract userId from query params or route parameters
    const { userId } = req.query; // or req.params if userId is in URL params

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.Listing.findAll({
      where: {
        status: "approved",
        owner_id: userId, // Filter by userId
      },
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          required: false,
          where: {
            item_type: "listing",
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
          as: "owner",
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

// Get all approved listing for a specific user (by userId)
exports.getAvailableListingsByUser = async (req, res) => {
  console.log("userId", req.query)
  try {
    // Extract userId from query params or route parameters
    const { userId } = req.query; // or req.params if userId is in URL params
   
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const listings = await models.Listing.findAll({
      where: {
        status: "approved",
        owner_id: userId, // Filter by userId
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
          as: "owner",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    // Return the filtered listings
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all posts with rental dates and durations: displayed in admin
exports.getAllListings = async (req, res) => {
  try {
    const listings = await models.Listing.findAll({
      attributes: ["id", "listing_name", "tags", "rate", "owner_id", "category", "created_at", "status"],
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          required: false,
          where: {
            item_type: "listing", 
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
          as: "owner",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    res.status(200).json(listings);
    // console.log(JSON.stringify(listings, null, 2)); // Log for debugging
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create listing: student side
exports.createListing = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    if (!req.body.listing && !req.body.item) {
      throw new Error("Listing or Item data is missing");
    }

    let createdItem;
    let itemType = 'listing';

    // Create listing or item for sale
    if (req.body.listing) {
      req.body.listing.status = "pending";  // Initially setting the listing status to "pending"
      createdItem = await models.Listing.create(req.body.listing, { transaction });
      itemType = 'listing';
    } else {
      createdItem = await models.ItemForSale.create(req.body.item, { transaction });
      itemType = 'item-for-sale';
    }
    
    // Handle rental dates and durations if provided
    const rentalDates = req.body.rental_dates || [];
    if (Array.isArray(rentalDates)) {
      for (const date of rentalDates) {
        if (!date.date) {
          throw new Error("Rental date is missing");
        }

        const rentalDate = await models.RentalDate.create(
          {
            item_id: createdItem.id,
            date: date.date,
            item_type: itemType,
          },
          { transaction }
        );
        console.log("Created rental date:", rentalDate);

        if (date.times && Array.isArray(date.times)) {
          for (const time of date.times) {
            if (!time.from || !time.to) {
              throw new Error("Rental time is missing from or to fields");
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
          console.warn(`No times provided for date: ${date.date}`);
        }
      }
    }


    // Commit the transaction
    await transaction.commit();

    // Get owner info
    const owner = await models.User.findOne({
      where: { user_id: req.body.item ? req.body.item.seller_id : req.body.listing.owner_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : "Unknown";

    // Create notification object
    const notification = {
      type: itemType === 'item-for-sale' ? "new-item-for-sale" : "new-listing",
      title: `New ${itemType === 'item-for-sale' ? "Item For Sale" : "Listing"} awaiting approval`,
      message: ` created new ${itemType === 'item-for-sale' ? "item" : "listing"} "${
        itemType === 'item-for-sale' ? createdItem.item_for_sale_name : createdItem.listing_name
      }"`,
      timestamp: new Date(),
      listingId: createdItem.id,
      category: createdItem.category,
      owner: {
        id: owner.user_id,
        name: ownerName,
      }
    };
    // Just before calling req.notifyAdmins
    console.log("ItemType:", itemType);
    console.log("CreatedItem:", {
      id: createdItem.id,
      name: itemType === 'item-for-sale' ? createdItem.item_for_sale_name : createdItem.listing_name,
     category: createdItem.category
    });
    console.log("Owner:", {
      id: owner.user_id,
      name: ownerName
    });

    // Notify admins using socket
    req.notifyAdmins(notification);  // This should trigger the socket event on the backend

    res.status(201).json(createdItem);
  } catch (error) {
    if (transaction.finished !== 'commit') {
      await transaction.rollback();
    }

    console.error("Error creating listing/item:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details: "Failed to create listing or item. Please check the input data and try again.",
    });
  }
};

// Get a single post by ID with associated rental dates, durations, and renter info: 
exports.getListingById = async (req, res) => {
  try {
    const post = await models.Listing.findByPk(req.params.id, {
      include: [
        {
          model: models.RentalDate,
          as: "rental_dates",
          include: [
            {
              model: models.RentalDuration,
              as: "durations",
              where: {
                status: "available",  // Filter durations by "available" status
              },
            },
          ],
          where: {
            status: "available",  // Filter rental dates by "available" status
          },
        },
        {
          model: models.User,
          as: "owner",
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
exports.updateListing = async (req, res) => {
  try {
    const post = await Listing.findByPk(req.params.id);
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
exports.deleteListing = async (req, res) => {
  try {
    const post = await Listing.findByPk(req.params.id);
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
    const listing = await models.Listing.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    listing.status = status;
    await listing.save();

    res.status(200).json(listing); 
  } catch (error) {
    console.error("Error updating listing status:", error);
    res.status(500).json({ error: error.message });
  }
};
