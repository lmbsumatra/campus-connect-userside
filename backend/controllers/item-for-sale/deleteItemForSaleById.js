const { models } = require("../../models/index");
const { rollbackUpload } = require("../../config/multer");

const deleteItemForSaleById = async (req, res) => {
  try {
    const itemForSaleId = req.params.itemForSaleId;

    if (!itemForSaleId || isNaN(itemForSaleId)) {
      return res.status(400).json({ error: "Invalid itemForSale ID" });
    }

    const itemForSale = await models.ItemForSale.findByPk(itemForSaleId);
    if (!itemForSale) {
      return res.status(404).json({ error: "itemForSale not found" });
    }

    if (itemForSale.seller_id && itemForSale.seller_id.toString() !== req.params.userId) {
      return res.status(403).json({ error: "Unauthorized to delete this itemForSale" });
    }

    let images = [];
    if (itemForSale.images && typeof itemForSale.images === "string") {
      try {
        images = JSON.parse(itemForSale.images);
      } catch (error) {
        console.error("Failed to parse itemForSale.images as JSON:", error);
      }
    }

    if (Array.isArray(images) && images.length > 0) {
      try {
        await rollbackUpload(images);
        console.log("Cloudinary rollback completed for images:", images);
      } catch (error) {
        console.error("Error during Cloudinary rollback:", error.message);
      }
    }

    const dates = await models.Date.findAll({
      where: {
        item_id: itemForSaleId,
        item_type: "item_for_sale", // Ensure only dates linked to `itemForSale` are targeted
      },
      attributes: ["id"],
    });

    const dateIds = dates.map((date) => date.id);

    if (dateIds.length > 0) {
      await models.Duration.destroy({
        where: {
          date_id: dateIds,
        },
      });

      await models.Date.destroy({
        where: {
          id: dateIds,
        },
      });

      console.log(`Deleted associated dates and durations for itemForSale ID ${itemForSaleId}`);
    }

    await itemForSale.destroy();

    console.log(
      `itemForSale ID ${itemForSaleId} and associated images deleted by User ID ${req.params.userId}`
    );

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting itemForSale:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deleteItemForSaleById;
