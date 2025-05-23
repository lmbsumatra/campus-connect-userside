const { models } = require("../../models");
const sequelize = require("../../config/database");
const sendAdminNotificationEmail = require("../../config/sendAdminNotificationEmail.jsx");

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
      throw new Error("Rental date is missing");s
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

const rollbackUpload = async (publicIds) => {
  // Your rollback logic for deleting images from wherever they were uploaded
  // This could be calling a cloud provider's API or removing from local storage
  try {
    for (const publicId of publicIds) {
      // If using a cloud service like Cloudinary, for example:
      await cloudinary.uploader.destroy(publicId);
      // console.log(`Rollback image: ${publicId}`);
    }
  } catch (err) {
    // console.error("Error during image rollback:", err);
  }
};

const addListing = async (req, res) => {
  const transaction = await sequelize.transaction();

  // console.log("Request body:", req.body);
  // console.log("Uploaded files:", req.files.upload_images);

  try {
    const listingData =
      typeof req.body.listing === "string"
        ? JSON.parse(req.body.listing)
        : req.body.listing;

    if (!listingData) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Listing data is missing",
      });
    }

    // Validate listing data
    try {
      validateListingData(listingData);
    } catch (validationError) {
      return res.status(400).json({
        error: "Validation Error",
        message: validationError.message,
      });
    }

    // Validate rental dates
    try {
      validateRentalDates(listingData.dates);
    } catch (validationError) {
      return res.status(400).json({
        error: "Validation Error",
        message: validationError.message,
      });
    }

    // Validate images
    let imageUrls;
    try {
      imageUrls = validateImages(req.files.upload_images);
    } catch (validationError) {
      return res.status(400).json({
        error: "Validation Error",
        message: validationError.message,
      });
    }

    // Set initial listing status
    listingData.status = "pending";

    // Create the listing
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
        tags: listingData.tags,
        status: "pending",
        specifications: listingData.specs,
        rental_dates: listingData.dates,
        late_charges: listingData.lateCharges,
        security_deposit: listingData.securityDeposit,
        repair_replacement: listingData.repairReplacement,
        location: listingData.location,
      },
      { transaction }
    );

    // Handle rental dates and times
    if (Array.isArray(listingData.dates)) {
      await Promise.all(
        listingData.dates.map(async ({ date, durations }) => {
          if (!date) {
            throw new Error("Date is required in each date entry");
          }

          const rentalDate = await models.Date.create(
            {
              item_id: listing.id,
              date,
              item_type: "listing",
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
        })
      );
    }

    // Fetch owner details
    const owner = await models.User.findOne({
      where: { user_id: listing.owner_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const ownerName = owner
      ? `${owner.first_name} ${owner.last_name}`
      : "Unknown";

    // Create notification in database
    const adminNotificationData = {
      type: "new-listing",
      title: "New Listing awaiting approval",
      message: ` created a new listing: "${listing.listing_name}"`,
      ownerName,
      ownerId: owner.user_id,
      itemId: listing.id,
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

    // Commit the transaction
    await transaction.commit();

    // Emit socket event after commit
    if (req.notifyAdmins) {
      req.notifyAdmins({
        ...adminNotification.toJSON(),
        owner: {
          id: owner.user_id,
          name: ownerName,
        },
      });
    }

    try {
     await  sendAdminNotificationEmail({
        actionType: "item_approval",
        itemName: `${listingData.itemName}`,
        details: "User has created an item",
        timestamp: new Date().toLocaleString()
      });
    } catch (emailError) {
      console.error("Error sending admin email notification:", emailError);
    }

    res.status(201).json({
      message: "Listing created successfully.",
      listing,
      notification: adminNotification.toJSON(),
    });
  } catch (error) {
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }

    // Rollback image upload if any images were uploaded
    if (req.files?.length) {
      const publicIds = req.files.map((file) => file.filename); // Adjust based on your storage system
      await rollbackUpload(publicIds);
    }

    // console.error("Listing creation error:", error);

    res.status(error.status || 500).json({
      error: error.name || "Internal Server Error",
      message: error.message || "Failed to create listing",
      details: error.stack,
    });
  }
};

module.exports = addListing;
