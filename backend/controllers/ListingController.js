const Listing = require("../models/listing/ListingModel");
const ListingRentalDate = require("../models/listing/ListingRentalDate");
const ListingRentalDuration = require("../models/listing/ListingRentalDuration");
const sequelize = require("../config/database");
const { models } = require("../models/index");

// Get all listings with rental dates and durations
exports.getAllListings = async (req, res) => {
  try {
    const listings = await models.Listing.findAll({
      attributes: ["id", "listing_name", "rate", "tags"],
      include: [
        {
          model: models.ListingRentalDate,
          as: "rental_dates",
          required: false,
          include: [
            {
              model: models.ListingRentalDuration,
              as: "durations",
              required: false,
            },
          ],
        },
      ],
    });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createListing = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Create the listing
    const listing = await models.Listing.create(req.body.listing, {
      transaction,
    });
    console.log(listing);

    // Handle rental dates
    const rentalDates = req.body.rental_dates;
    for (const date of rentalDates) {
      // console.log("Processing rental date:", date);

      if (!date.date) {
        throw new Error("Rental date is missing");
      }

      const rentalDate = await models.ListingRentalDate.create(
        {
          listing_id: listing.id,
          rental_date: date.date,
        },
        { transaction }
      );

      if (date.times) {
        for (const time of date.times) {
          await models.ListingRentalDuration.create(
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
      details:
        "Failed to create listing. Please check the input data and try again.",
    });
  }
};

// Get a single listing by ID with associated rental dates, durations, and owner info
exports.getListingById = async (req, res) => {
  try {
    const listing = await models.Listing.findByPk(req.params.id, {
      include: [
        {
          model: models.ListingRentalDate,
          as: "rental_dates",
          include: [
            {
              model: models.ListingRentalDuration,
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

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    await listing.update(req.body);
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    await listing.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
