const { models } = require("../../models");
const sequelize = require("../../config/database");
const fs = require("fs");
const path = require("path");

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

  rentalDates.forEach(({ date, durations }) => {
    if (!date) {
      throw new Error("Each rental date must have a valid date.");
    }

    if (!Array.isArray(durations)) {
      throw new Error("Time periods should be an array.");
    }

    durations.forEach((period) => {
      if (!period.timeFrom || !period.timeTo) {
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
      // console.log(`Rollback image: ${publicId}`);
    }
  } catch (err) {
    // console.error("Error during image rollback:", err);
  }
};
// Main function
const addItemForSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  // console.log("Request body:", req.body);
  // console.log("Uploaded files:", req.files.upload_images);

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
    const imageUrls = validateImages(req.files.upload_images); // Using local file paths

    // Validate rental dates if present
    if (Array.isArray(itemData.dates)) {
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
        location: itemData.location,
      },
      { transaction }
    );

    // Process rental dates (if any)
    if (Array.isArray(itemData.dates)) {
      for (const { date, durations } of itemData.dates) {
        if (!date) throw new Error("Date is required in each date entry");

        const rentalDate = await models.Date.create(
          {
            item_id: item.id,
            date,
            item_type: "item_for_sale",
          },
          { transaction }
        );

        if (!Array.isArray(durations)) {
          throw new Error("Time periods must be provided as an array");
        }

        await Promise.all(
          durations.map((period) => {
            if (!period.timeFrom || !period.timeTo) {
              throw new Error("Both start and end times are required");
            }

            return models.Duration.create(
              {
                date_id: rentalDate.id,
                rental_time_from: period.timeFrom,
                rental_time_to: period.timeTo,
              },
              { transaction }
            );
          })
        );
      }
    }

    // Fetch seller details
    const seller = await models.User.findOne({
      where: { user_id: item.seller_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const sellerName = seller
      ? `${seller.first_name} ${seller.last_name}`
      : "Unknown";

    // Create notification in database
    const adminNotificationData = {
      type: "new-item-for-sale",
      title: "New Item for Sale awaiting approval",
      message: ` created a new item for sale: "${item.item_for_sale_name}"`,
      ownerName: sellerName,
      ownerId: seller.user_id,
      itemId: item.id,
      itemType: "item_for_sale",
      timestamp: new Date(),
      isRead: false,
    };

    const adminNotification = await models.Notification.create(
      adminNotificationData,
      {
        transaction,
      }
    );

    // Commit transaction
    await transaction.commit();

    // Emit socket event after commit
    if (req.notifyAdmins) {
      req.notifyAdmins({
        ...adminNotification.toJSON(),
        owner: {
          id: seller.user_id,
          name: sellerName,
        },
      });
    }

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
