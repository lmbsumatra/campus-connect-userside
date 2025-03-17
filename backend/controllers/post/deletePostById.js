const { models } = require("../../models/index");
const { rollbackUpload } = require("../../config/multer");

const deletePostById = async (req, res) => {
  try {
    const { postId, userId } = req.params;
    // console.log("Attempting to delete itemForSale:", postId, "by user:", userId);

    if (!postId || isNaN(postId)) {
      return res.status(400).json({ error: "Invalid itemForSale ID" });
    }

    const post = await models.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "itemForSale not found" });
    }

    if (post.user_id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this itemForSale" });
    }

    // Handle Cloudinary Image Deletion
    let images = [];
    if (post.images && typeof post.images === "string") {
      try {
        images = JSON.parse(post.images);
      } catch (error) {
        console.error("Failed to parse itemForSale.images as JSON:", error);
      }
    }

    if (Array.isArray(images) && images.length > 0) {
      try {
        const cloudinaryBaseUrl = "https://res.cloudinary.com/";
        const cloudinaryImages = images.filter((url) =>
          url.startsWith(cloudinaryBaseUrl)
        );

        if (cloudinaryImages.length > 0) {
          await rollbackUpload(cloudinaryImages);
          // console.log("Cloudinary rollback completed for images:", cloudinaryImages);
        } else {
          // console.log("No Cloudinary images to delete.");
        }
      } catch (error) {
        console.error("Error during Cloudinary rollback:", error.message);
      }
    }

    // Delete the item (Cascade deletes related records)
    await post.destroy();

    // console.log(`ItemForSale ID ${postId} deleted successfully by User ID ${userId}`);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting itemForSale:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deletePostById;
