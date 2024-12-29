const { models } = require("../../models");
const sequelize = require("../../config/database");
const fs = require("fs");
const path = require("path");

// Helper functions
const validateItemData = (itemData) => {
  const requiredFields = [
    "sellerId",
    "itemName",
    "itemCondition",
    "paymentMethod",
    "price",
  ];
  const missingFields = requiredFields.filter((field) => !itemData[field]);

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

  rentalDates.forEach(({ date, timePeriods }) => {
    if (!date) {
      throw new Error("Each rental date must have a valid date.");
    }

    if (!Array.isArray(timePeriods)) {
      throw new Error("Time periods should be an array.");
    }

    timePeriods.forEach((period) => {
      if (!period.startTime || !period.endTime) {
        throw new Error(
          "Both start and end times are required for each time period."
        );
      }
    });
  });
};

const rollbackUpload = async (publicIds) => {
  // Your rollback logic for deleting images from wherever they were uploaded
  // This could be calling a cloud provider's API or removing from local storage
  try {
    for (const publicId of publicIds) {
      // If using a cloud service like Cloudinary, for example:
      // await cloudinary.uploader.destroy(publicId);
      console.log(`Rollback image: ${publicId}`);
    }
  } catch (err) {
    console.error("Error during image rollback:", err);
  }
};
// Main function
const addItemForSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const itemData =
      typeof req.body.item === "string"
        ? JSON.parse(req.body.item)
        : req.body.item;

    if (!itemData) {
      throw new Error("Item for sale data is missing");
    }

    // Validate the item data and images
    validateItemData(itemData);
    const imageUrls = validateImages(req.files); // Using local file paths

    // Validate rental dates if present
    if (Array.isArray(itemData.dates)) {
      console.log(itemData.dates)
      validateRentalDates(itemData.dates); // Validate rental dates and time periods
    }

    // Create item for sale in the database
    const item = await models.ItemForSale.create(
      {
        seller_id: itemData.sellerId,
        category: itemData.category,
        item_for_sale_name: itemData.itemName,
        item_condition: itemData.itemCondition,
        payment_mode: itemData.paymentMethod,
        price: itemData.price,
        images: JSON.stringify(imageUrls),
        description: itemData.desc,
        tags: itemData.tags,
        status: "pending",
        specifications: itemData.specs,
      },
      { transaction }
    );

    // Process rental dates (if any)
    if (Array.isArray(itemData.dates)) {
      for (const { date, timePeriods } of itemData.dates) {
        if (!date) throw new Error("Date is required in each date entry");

        const rentalDate = await models.Date.create(
          {
            item_id: item.id,
            date,
            item_type: "item_for_sale",
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

    // Commit transaction
    await transaction.commit();
    res
      .status(201)
      .json({ message: "Item for sale created successfully.", item });
  } catch (error) {
    // Rollback transaction and delete uploaded files
    await transaction.rollback();

    // Rollback image upload if any images were uploaded
    if (req.files?.length) {
      const publicIds = req.files.map((file) => file.filename); // Adjust based on your storage system
      await rollbackUpload(publicIds);
    }

    // Send error response
    res.status(400).json({
      error: "Validation Error",
      message: error.message,
    });
  }
};

module.exports = addItemForSale;
