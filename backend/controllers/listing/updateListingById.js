const { models } = require("../../models/index");
const sequelize = require("../../config/database");
const { rollbackUpload } = require("../../config/multer");

// Helper function to validate item data
const validateUpdateData = (listingData) => {
  const requiredFields = ["id", "ownerId", "itemName", "category"];
  const missingFields = requiredFields.filter((field) => !listingData[field]);

  if (missingFields.length) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
};

// Helper function to add new dates and durations
const addDatesAndDurations = async (listingId, dates) => {
  for (const date of dates) {
    // console.log(`Checking if date ${date.date} exists for item ${listingId}`);

    // Check if the date already exists in the database
    const existingDate = await models.Date.findOne({
      where: {
        item_id: listingId,
        date: date.date, // Check if date exists
        item_type: "listing",
      },
    });

    let dateRecord;
    if (existingDate) {
      // console.log(
      //   `Date ${date.date} already exists for item ${listingId}. Using existing date.`
      // );
      dateRecord = existingDate; // Use existing date
    } else {
      // console.log(
      //   `Date ${date.date} not found. Creating new date for item ${listingId}.`
      // );
      // If not exists, create a new date record
      dateRecord = await models.Date.create({
        item_id: listingId,
        date: date.date,
        status: date.status,
        item_type: "listing",
      });
      // console.log(
      //   `Created new date: ${dateRecord.date} with ID ${dateRecord.id}`
      // );
    }

    // Check if any duration for the current date already exists
    for (const duration of date.durations) {
      // console.log(
      //   `Checking if duration from ${duration.timeFrom} to ${duration.timeTo} exists for date ${dateRecord.id}`
      // );

      const existingDuration = await models.Duration.findOne({
        where: {
          date_id: dateRecord.id,
          rental_time_from: duration.timeFrom,
          rental_time_to: duration.timeTo,
        },
      });

      if (existingDuration) {
        // console.log(
        //   `Duration from ${duration.timeFrom} to ${duration.timeTo} already exists for date ${dateRecord.id}. Skipping creation.`
        // );
      } else {
        // console.log(
        //   `Duration from ${duration.timeFrom} to ${duration.timeTo} does not exist. Creating new duration.`
        // );
        // If duration doesn't exist, create a new duration
        await models.Duration.create({
          date_id: dateRecord.id,
          rental_time_from: duration.timeFrom,
          rental_time_to: duration.timeTo,
          status: duration.status,
        });
        // console.log(
        //   `Created new duration from ${duration.timeFrom} to ${duration.timeTo} for date ${dateRecord.id}`
        // );
      }
    }
  }
};

const removeDatesAndDurations = async (listingId, removedDates) => {
  for (const removedDate of removedDates) {
    // Find the date record by listingId and date
    const dateRecord = await models.Date.findOne({
      where: {
        item_id: listingId,
        date: removedDate,
        item_type: "listing",
      },
    });

    if (dateRecord) {
      // console.log(
      //   `Processing date ${removedDate} for removal for listing ${listingId}`
      // );

      // Check if this date is linked to any rental transactions
      const rentalTransactionForDate = await models.RentalTransaction.findOne({
        where: { date_id: dateRecord.id },
      });

      if (rentalTransactionForDate) {
        // console.log(
        //   `Date ${removedDate} is linked to active rentals. Skipping deletion.`
        // );
        continue; // Skip this date
      }

      // Fetch associated durations
      const durations = await models.Duration.findAll({
        where: { date_id: dateRecord.id },
      });

      for (const duration of durations) {
        // Check if this duration is linked to any rental transactions
        const rentalTransactionForDuration =
          await models.RentalTransaction.findOne({
            where: { time_id: duration.id },
          });

        if (rentalTransactionForDuration) {
          // console.log(
          //   `Duration from ${duration.rental_time_from} to ${duration.rental_time_to} is linked to active rentals. Skipping deletion.`
          // );
          continue; // Skip this duration
        }

        // If no active rentals, delete the duration
        await duration.destroy();
        // console.log(
        //   `Removed duration from ${duration.rental_time_from} to ${duration.rental_time_to}`
        // );
      }

      // Check if all durations for the date are removed
      const remainingDurations = await models.Duration.findAll({
        where: { date_id: dateRecord.id },
      });

      if (remainingDurations.length === 0) {
        // If no durations remain, delete the date
        await dateRecord.destroy();
        // console.log(`Removed date ${removedDate}`);
      } else {
        // console.log(
        //   `Date ${removedDate} has active durations linked to rentals. Skipping date deletion.`
        // );
      }
    } else {
      // console.log(`No date record found for date ${removedDate}`);
    }
  }
};

// Main function
const updateListingById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Extract `listingId` from request parameters
    const listingId = req.params.listingId;

    if (!listingId) {
      throw new Error("Listing ID is required");
    }

    // console.log(`Listing ID ${listingId} received for update`);

    // Parse and validate the listing data
    const listingData =
      typeof req.body.listing === "string"
        ? JSON.parse(req.body.listing)
        : req.body.listing;

    if (!listingData) {
      throw new Error("No listing data provided");
    }

    listingData.id = listingId; // Include `listingId` in `listingData`

    // Validate the data
    validateUpdateData(listingData);

    // Prepare image URLs if new images are uploaded
    let imageUrls = [];

    if (req.files?.upload_images) {
      imageUrls = Array.isArray(req.files.upload_images)
        ? req.files.upload_images.map((file) => file.path)
        : [req.files.upload_images.path];
    }

    // console.log("Uploaded Cloudinary URLs:", imageUrls);

    // Extract remove_images field if provided
    const removeImages = req.body.remove_images || [];
    // console.log("Images to remove:", removeImages);

    // Extract removed dates if provided
    const removedDates = Array.isArray(listingData.toRemoveDates)
      ? listingData.toRemoveDates
      : [];
    // console.log("Dates to remove:", removedDates);

    // Fetch the existing listing
    const existingListing = await models.Listing.findByPk(listingId);
    if (!existingListing) {
      if (imageUrls.length) await rollbackUpload(imageUrls); // Rollback uploaded images
      throw new Error("Listing not found");
    }

    // console.log(`Found existing listing with ID ${existingListing.id}`);

    // If images are to be removed, process the removal
    if (removeImages.length) {
      const oldImages = JSON.parse(existingListing.images || "[]");
      const imagesToDelete = removeImages.filter((removeUrl) =>
        oldImages.includes(removeUrl)
      );

      // console.log(`Removing images: ${imagesToDelete.join(", ")}`);

      if (imagesToDelete.length) {
        await rollbackUpload(imagesToDelete);
      }

      const remainingImages = oldImages.filter(
        (image) => !imagesToDelete.includes(image)
      );

      existingListing.images = JSON.stringify(remainingImages);
    }

    // If there are new images, update them
    if (imageUrls.length) {
      const oldImages = JSON.parse(existingListing.images || "[]");
      await rollbackUpload(oldImages);
      existingListing.images = JSON.stringify(imageUrls);
    }

    // Update the listing in the database
    await models.Listing.update(
      {
        category: listingData.category,
        listing_name: listingData.itemName,
        rate: listingData.price,
        images: JSON.stringify(imageUrls),
        description: listingData.desc,
        images: existingListing.images,
        late_charges: listingData.lateCharges,
        security_deposit: listingData.securityDeposit,
        repair_replacement: listingData.repairReplacement,
        location: listingData.location,
        listing_condition:
          listingData.itemCondition || existingListing.listing_condition,
        payment_mode: listingData.paymentMethod || existingListing.payment_mode,
        delivery_mode:
          listingData.deliveryMethod || existingListing.delivery_mode,
        price: listingData.price || existingListing.price,
        tags: listingData.tags || existingListing.tags,
        specifications: listingData.specs || existingListing.specifications,
        status: "pending",
        status_message: "Pending approval",
      },
      { where: { id: listingId }, transaction }
    );

    // Remove dates and durations if they exist in removedDates
    if (removedDates.length > 0) {
      // console.log("Removing dates and associated durations...");
      await removeDatesAndDurations(listingId, removedDates);
    }

    // Add new dates and durations if they exist in listingData
    if (listingData.dates && listingData.dates.length > 0) {
      // console.log("Adding new dates and durations...");
      await addDatesAndDurations(listingId, listingData.dates);
    } else {
      // console.log("No new dates or durations provided.");
    }

    // Fetch owner details
    const owner = await models.User.findOne({
      where: { user_id: existingListing.owner_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const ownerName = owner
      ? `${owner.first_name} ${owner.last_name}`
      : "Unknown";

    // Create notification in database
    const adminNotificationData = {
      type: "new-listing",
      title: "Updated Listing awaiting approval",
      message: ` updated a new listing: "${existingListing.listing_name}"`,
      ownerName,
      ownerId: owner.user_id,
      itemId: existingListing.id,
      itemType: "listing",
      timestamp: new Date(),
      isRead: false,
    };

    const adminNotification = await models.Notification.create(
      adminNotificationData,
      {
        transaction,
      }
    );

    if (req.notifyAdmins) {
      req.notifyAdmins({
        ...adminNotification.toJSON(),
        owner: {
          id: owner.user_id,
          name: ownerName,
        },
      });
    }

    await transaction.commit();
    // console.log("Transaction committed");

    res.status(200).json({
      message: "Listing updated successfully",
      updatedItem: {
        ...listingData,
        images: imageUrls.length
          ? imageUrls
          : JSON.parse(existingListing.images),
      },
    });
  } catch (error) {
    await transaction.rollback();
    // console.log("Transaction rolled back due to error");

    const imageUrls = req.files?.upload_images
      ? Array.isArray(req.files.upload_images)
        ? req.files.upload_images.map((file) => file.path)
        : [req.files.upload_images.path]
      : [];
    if (imageUrls.length) {
      await rollbackUpload(imageUrls);
      // console.log("Rolled back uploaded images");
    }

    res.status(400).json({
      error: "Update Error",
      message: error.message,
    });
  }
};

module.exports = updateListingById;
