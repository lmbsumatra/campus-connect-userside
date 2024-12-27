const { models } = require("../../models");
const sequelize = require("../../config/database");

const validateListingData = (listingData) => {
  const requiredFields = ["ownerId", "itemName", "category", "desc"];
  const missingFields = requiredFields.filter((field) => !listingData[field]);

  if (missingFields.length) {
    throw new Error(`Required fields missing: ${missingFields.join(", ")}`);
  }
};

const validateRentalDates = (rentalDates) => {
  if (!Array.isArray(rentalDates)) {
    throw new Error("Rental dates should be an array");
  }

  rentalDates.forEach((date) => {
    if (!date.date) {
      throw new Error("Rental date is missing");
    }

    if (date.times && !Array.isArray(date.times)) {
      throw new Error("Rental times should be an array");
    }
  });
};

const validateImages = (files) => {
  if (!files?.length) {
    throw new Error("At least one image must be uploaded.");
  }
  return files.map((file) => file.path);
};

const addListing = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const listingData =
      typeof req.body.listing === "string"
        ? JSON.parse(req.body.listing)
        : req.body.listing;
    console.log(req.body.listing);

    if (!listingData) {
      throw new Error("Listing data is missing");
    }

    validateListingData(listingData);

    // Set initial listing status to "pending"
    listingData.status = "pending";

    const imageUrls = validateImages(req.files);

    const listing = await models.Listing.create(
      {
        owner_id: listingData.ownerId,
        category: listingData.category,
        listing_name: listingData.itemName,
        listing_condition: listingData.itemCondition,
        payment_mode: listingData.paymentMethod,
        rate: listingData.price,
        images: JSON.stringify(imageUrls),
        description: listingData.desc,
        tags: JSON.stringify(listingData.tags),
        status: "pending",
        specifications: listingData.specs,
        rental_dates: listingData.dates,
        late_charges: listingData.lateCharges,
        security_deposit: listingData.securityDeposit,
        repar_replacement: listingData.reparReplacement
      },
      { transaction }
    );

      if (Array.isArray(listingData.dates)) {
        for (const { date, timePeriods } of listingData.dates) {
          if (!date) throw new Error("Date is required in each date entry");

          const rentalDate = await models.Date.create(
            {
              item_id: listing.id,
              date,
              item_type: "listing",
            },
            { transaction }
          );

          if (!Array.isArray(timePeriods)) {
            throw new Error("Time periods must be provided as an array");
          }

          await Promise.all(
            timePeriods.map((period) => {
              if (!period.startTime || !period.endTime) {
                throw new Error("Both start and end times are required");
              }

              return models.Duration.create(
                {
                  date_id: rentalDate.id,
                  rental_time_from: period.startTime,
                  rental_time_to: period.endTime,
                },
                { transaction }
              );
            })
          );
        }
      }
  

    await transaction.commit();

    // Get owner info
    const owner = await models.User.findOne({
      where: { user_id: listing.owner_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const ownerName = owner
      ? `${owner.first_name} ${owner.last_name}`
      : "Unknown";

    // Create notification object
    const notification = {
      type: "new-listing",
      title: "New Listing awaiting approval",
      message: ` created new listing "${listing.listing_name}"`,
      timestamp: new Date(),
      listingId: listing.id,
      category: listing.category,
      owner: {
        id: owner.user_id,
        name: ownerName,
      },
    };

    // Notify admins (assuming this triggers an event for admin notification)
    // req.notifyAdmins(notification);

    res.status(201).json({ message: "Listing created successfully.", listing });
  } catch (error) {
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }

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

module.exports = addListing;
