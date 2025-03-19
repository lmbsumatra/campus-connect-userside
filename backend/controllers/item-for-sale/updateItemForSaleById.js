const { models } = require("../../models/index");
const sequelize = require("../../config/database");
const { rollbackUpload } = require("../../config/multer");

// Helper function to validate item data
const validateUpdateData = (itemData) => {
  const requiredFields = ["id", "sellerId", "itemName", "category"];
  const missingFields = requiredFields.filter((field) => !itemData[field]);

  if (missingFields.length) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
};

// Helper function to add new dates and durations
const addDatesAndDurations = async (itemId, dates) => {
  for (const date of dates) {
    // console.log(`Checking if date ${date.date} exists for item ${itemId}`);

    // Check if the date already exists in the database
    const existingDate = await models.Date.findOne({
      where: {
        item_id: itemId,
        date: date.date, // Check if date exists
        item_type: "item_for_sale",
      },
    });

    let dateRecord;
    if (existingDate) {
      // console.log(
      //   `Date ${date.date} already exists for item ${itemId}. Using existing date.`
      // );
      dateRecord = existingDate; // Use existing date
    } else {
      // console.log(
      //   `Date ${date.date} not found. Creating new date for item ${itemId}.`
      // );
      // If not exists, create a new date record
      dateRecord = await models.Date.create({
        item_id: itemId,
        date: date.date,
        status: date.status,
        item_type: "item_for_sale",
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

// Helper function to remove dates and their associated durations
const removeDatesAndDurations = async (itemId, removedDates) => {
  for (const removedDate of removedDates) {
    // Find the date record by itemId and date
    const dateRecord = await models.Date.findOne({
      where: {
        item_id: itemId,
        date: removedDate,
        item_type: "item_for_sale",
      },
    });

    if (dateRecord) {
      // console.log(
      //   `Processing date ${removedDate} for removal for item ${itemId}`
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
const updateItemForSaleById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Extract `itemId` from request parameters
    const itemId = req.params.itemId;

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    // console.log(`Item ID ${itemId} received for update`);

    // Parse and validate the item data
    const itemData =
      typeof req.body.item === "string"
        ? JSON.parse(req.body.item)
        : req.body.item;

    if (!itemData) {
      throw new Error("No item data provided");
    }

    itemData.id = itemId; // Include `itemId` in `itemData`

    // Validate the data
    validateUpdateData(itemData);

    // Prepare image URLs if new images are uploaded
    let imageUrls = [];

    if (req.files?.upload_images) {
      // If there are files in the "upload_images" field
      imageUrls = Array.isArray(req.files.upload_images)
        ? req.files.upload_images.map((file) => file.path)
        : [req.files.upload_images.path];
    }

    // console.log("Uploaded Cloudinary URLs:", imageUrls); // Debug uploaded URLs

    // Extract remove_images field if provided
    const removeImages = req.body.remove_images || [];
    // console.log("Images to remove:", removeImages); // Debug remove images

    // Extract removed dates if provided
    const removedDates = Array.isArray(itemData.toRemoveDates)
      ? itemData.toRemoveDates
      : [];
    // console.log("Dates to remove:", removedDates); // Debug removed dates

    // Fetch the existing item
    const existingItem = await models.ItemForSale.findByPk(itemId);
    if (!existingItem) {
      if (imageUrls.length) await rollbackUpload(imageUrls); // Rollback uploaded images
      throw new Error("Item not found");
    }

    // console.log(`Found existing item with ID ${existingItem.id}`);

    // If images are to be removed, process the removal
    if (removeImages.length) {
      const oldImages = JSON.parse(existingItem.images || "[]");
      const imagesToDelete = removeImages.filter((removeUrl) =>
        oldImages.includes(removeUrl)
      );

      // console.log(`Removing images: ${imagesToDelete.join(", ")}`);

      // Rollback the old images that are being removed
      if (imagesToDelete.length) {
        await rollbackUpload(imagesToDelete);
      }

      // Filter out the removed images from the existing images
      const remainingImages = oldImages.filter(
        (image) => !imagesToDelete.includes(image)
      );

      // Set new images after removal
      existingItem.images = JSON.stringify(remainingImages);
    }

    // If there are new images, update them
    if (imageUrls.length) {
      const oldImages = JSON.parse(existingItem.images || "[]");
      await rollbackUpload(oldImages); // Rollback old images if new ones are provided
      existingItem.images = JSON.stringify(imageUrls);
    }

    // Update the item in the database
    await models.ItemForSale.update(
      {
        category: itemData.category,
        item_for_sale_name: itemData.itemName,
        description: itemData.desc,
        images: existingItem.images, // Retain updated images
        item_condition: itemData.itemCondition || existingItem.item_condition,
        payment_mode: itemData.paymentMethod || existingItem.payment_mode,
        delivery_mode: itemData.deliveryMethod || existingItem.delivery_mode,
        price: itemData.price || existingItem.price,
        tags: itemData.tags || existingItem.tags,
        specifications: itemData.specs || existingItem.specifications,
      },
      { where: { id: itemId }, transaction }
    );

    // Remove the dates and durations if they exist in removedDates
    if (removedDates.length > 0) {
      // console.log("Removing dates and associated durations...");
      await removeDatesAndDurations(itemId, removedDates);
    }

    // Add new dates and durations if they exist in itemData
    if (itemData.dates && itemData.dates.length > 0) {
      // console.log("Adding new dates and durations...");
      await addDatesAndDurations(itemId, itemData.dates);
    } else {
      // console.log("No new dates or durations provided.");
    }

    // Commit the transaction
    await transaction.commit();
    // console.log("Transaction committed");

    res.status(200).json({
      message: "Item updated successfully",
      updatedItem: {
        ...itemData,
        images: imageUrls.length ? imageUrls : JSON.parse(existingItem.images),
      },
    });
  } catch (error) {
    // Rollback the transaction in case of any errors
    await transaction.rollback();
    // console.log("Transaction rolled back due to error: ", error);

    // Rollback uploaded images if any
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

module.exports = updateItemForSaleById;
