const { models } = require("../../models/index");
const { rollbackUpload } = require("../../config/multer");

const deleteItemForSaleById = async (req, res) => {
  try {
    const { itemForSaleId, userId } = req.params;
    // console.log("Attempting to delete itemForSale:", itemForSaleId, "by user:", userId);

    if (!itemForSaleId || isNaN(itemForSaleId)) {
      return res.status(400).json({ error: "Invalid itemForSale ID" });
    }

    const itemForSale = await models.ItemForSale.findByPk(itemForSaleId);
    if (!itemForSale) {
      return res.status(404).json({ error: "itemForSale not found" });
    }

    if (itemForSale.seller_id.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this itemForSale" });
    }

    // Handle Cloudinary Image Deletion
    let images = [];
    if (itemForSale.images && typeof itemForSale.images === "string") {
      try {
        images = JSON.parse(itemForSale.images);
      } catch (error) {
        // console.error("Failed to parse itemForSale.images as JSON:", error);
      }
    }

    if (Array.isArray(images) && images.length > 0) {
      try {
        const cloudinaryBaseUrl = "https://res.cloudinary.com/";
        const cloudinaryImages = images.filter((url) => url.startsWith(cloudinaryBaseUrl));

        if (cloudinaryImages.length > 0) {
          await rollbackUpload(cloudinaryImages);
          // console.log("Cloudinary rollback completed for images:", cloudinaryImages);
        } else {
          // console.log("No Cloudinary images to delete.");
        }
      } catch (error) {
        // console.error("Error during Cloudinary rollback:", error.message);
      }
    }

    // Delete the item (Cascade deletes related records)
    await itemForSale.destroy();

    // console.log(`ItemForSale ID ${itemForSaleId} deleted successfully by User ID ${userId}`);
    res.status(204).send();
  } catch (error) {
    // console.error("Error deleting itemForSale:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deleteItemForSaleById;
