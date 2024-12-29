const { models } = require("../../models/index");
const { rollbackUpload } = require("../../config/multer"); // Import the rollbackUpload function

const deleteItemForSaleById = async (req, res) => {
  try {
    const itemForSaleId = req.params.itemForSaleId;

    // Validate the itemForSale ID
    if (!itemForSaleId || isNaN(itemForSaleId)) {
      return res.status(400).json({ error: "Invalid itemForSale ID" });
    }

    // Find the itemForSale by primary key
    const itemForSale = await models.ItemForSale.findByPk(itemForSaleId);
    if (!itemForSale) {
      return res.status(404).json({ error: "itemForSale not found" });
    }

    // Ensure the user is authorized to delete the itemForSale
    if (itemForSale.seller_id && itemForSale.seller_id.toString() !== req.params.userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this itemForSale" });
    }

    // Parse the images field if it's a JSON string
    let images = [];
    if (itemForSale.images && typeof itemForSale.images === "string") {
      try {
        images = JSON.parse(itemForSale.images); // Parse the JSON string
      } catch (error) {
        console.error("Failed to parse itemForSale.images as JSON:", error);
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

    // Find all associated date IDs
    const dates = await models.Date.findAll({
      where: {
        item_id: itemForSaleId,
      },
      attributes: ["id"],
    });

    const dateIds = dates.map((date) => date.id);

    // Delete the associated durations
    if (dateIds.length > 0) {
      await models.Duration.destroy({
        where: {
          date_id: dateIds,
        },
      });

      // Delete the associated dates
      await models.Date.destroy({
        where: {
          id: dateIds,
        },
      });

      console.log(`Deleted associated dates and durations for itemForSale ID ${itemForSaleId}`);
    }

    // Delete the itemForSale from the database
    await itemForSale.destroy();

    console.log(
      `itemForSale ID ${itemForSaleId} and associated images deleted by User ID ${req.params.userId}`
    );

    res.status(204).send(); // Respond with no content, meaning deletion was successful
  } catch (error) {
    console.error("Error deleting itemForSale:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deleteItemForSaleById;
