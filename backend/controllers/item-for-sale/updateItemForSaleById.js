const { models } = require("../../models/index");
const { rollbackUpload } = require("../../config/multer");

const updateItemForSaleById = async (req, res) => {
  try {
    // Extract `listingId` from request parameters
    const itemId = req.params.itemId;

    if (!itemId) {
      return res.status(400).json({ message: "Listing ID is required" });
    }

    console.log("Listing ID:", itemId);

    // Parse and validate the listing data
    let itemData;
    try {
      itemData = req.body.listing ? JSON.parse(req.body.listing) : null;

      if (!itemData) {
        return res.status(400).json({ message: "No listing data provided" });
      }

      itemData.id = itemId; // Set `listingId` into `itemData`
    } catch (parseError) {
      console.error("Error parsing listing data:", parseError);
      return res.status(400).json({ message: "Invalid listing data format" });
    }

    console.log("Parsed listing data:", itemData);

    // Validate required fields
    const requiredFields = ["id", "ownerId", "itemName", "category"];
    const missingFields = requiredFields.filter((field) => !itemData[field]);

    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Prepare image URLs for update (if any)
    const imageUrls = req.files?.item_images?.map((file) => file.path) || [];

    // Update listing in the database
    const [updateCount] = await models.Listing.update(
      {
        category: itemData.category,
        listing_name: itemData.itemName,
        description: itemData.description,
        images: JSON.stringify(imageUrls), // Add new images if provided
        // Add other fields to update as needed
      },
      { where: { id: listingId } }
    );

    if (!updateCount) {
      // If no rows were updated, the listing does not exist
      if (imageUrls.length) {
        // Rollback image upload if the listing update fails
        await rollbackUpload(imageUrls);
      }

      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({
      message: "Listing updated successfully",
      updatedFields: {
        ...itemData,
        images: imageUrls,
      },
    });
  } catch (error) {
    console.error("Error updating listing:", error);

    // Rollback uploaded images in case of any error
    const imageUrls = req.files?.item_images?.map((file) => file.path) || [];
    if (imageUrls.length) {
      await rollbackUpload(imageUrls);
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateItemForSaleById;
