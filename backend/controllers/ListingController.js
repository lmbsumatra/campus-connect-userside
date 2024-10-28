const Listing = require("../models/listing/ListingModel");
const sequelize = require("../config/database");
const { models } = require("../models/index");

// Get all posts with rental dates and durations
exports.getAllListings = async (req, res) => {
  try {
    const listings = await models.Listing.findAll({
      attributes: ["id", "listing_name", "tags", "rate", "owner_id"],
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
      ],
    });

    res.status(200).json(listings);
    // console.log(JSON.stringify(listings, null, 2)); // Log for debugging
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a post
exports.createListing = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (!req.body.listing) {
      throw new Error("Listing data is missing");
    }

    const listing = await models.Listing.create(req.body.listing, {
      transaction,
    });
    console.log("Created listing:", listing);

    const rentalDates = req.body.rental_dates;

    if (!Array.isArray(rentalDates)) {
      throw new Error("Rental dates should be an array");
    }

    for (const date of rentalDates) {
      if (!date.date) {
        throw new Error("Rental date is missing");
      }

      const rentalDate = await models.RentalDate.create(
        {
          item_id: listing.id,
          date: date.date,
          item_type: "listing",
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

    await transaction.commit();
    res.status(201).json(listing);
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
      details: "Failed to create listing. Please check the input data and try again.",
    });
  }
};


// Get a single post by ID with associated rental dates, durations, and renter info
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
