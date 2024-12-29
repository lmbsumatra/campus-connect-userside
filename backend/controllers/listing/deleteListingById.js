const { models } = require("../../models/index");
const { rollbackUpload } = require("../../config/multer"); // Import the rollbackUpload function

const deleteListingById = async (req, res) => {
  try {
    const listingId = req.params.listingId;

    // Validate the listing ID
    if (!listingId || isNaN(listingId)) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }

    // Find the listing by primary key
    const listing = await models.Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Ensure the user is authorized to delete the listing
    if (listing.owner_id && listing.owner_id.toString() !== req.params.userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this listing" });
    }

    // Parse the images field if it's a JSON string
    let images = [];
    if (listing.images && typeof listing.images === "string") {
      try {
        images = JSON.parse(listing.images); // Parse the JSON string
      } catch (error) {
        console.error("Failed to parse listing.images as JSON:", error);
      }
    }

    console.log("Parsed images:", images, Array.isArray(images), images.length);

    // Call rollbackUpload to delete images from Cloudinary if there are any images
    if (Array.isArray(images) && images.length > 0) {
      try {
        await rollbackUpload(images); // Delete the images from Cloudinary
        console.log("Cloudinary rollback completed for images:", images);
      } catch (error) {
        console.error("Error during Cloudinary rollback:", error.message);
      }
    }

    // Delete the listing from the database
    await listing.destroy();

    console.log(
      `Listing ID ${listingId} and associated images deleted by User ID ${req.params.userId}`
    );

    res.status(204).send(); // Respond with no content, meaning deletion was successful
  } catch (error) {
    console.error("Error deleting listing:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deleteListingById;
