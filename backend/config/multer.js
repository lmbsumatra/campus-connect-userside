const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const folder = file.fieldname;
    const publicId = `${req.user_id || "anonymous"}_${
      file.fieldname
    }_${Date.now()}`;
    return {
      folder: folder,
      public_id: publicId,
    };
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "scanned_id" },
  { name: "photo_with_id" },
]);

const upload_prof = multer({ storage: storage }).single("profile_pic");

const upload_item = multer({ storage: storage }).fields([
  { name: "upload_images", maxCount: 5 },
  { name: "remove_images" }, // If needed for rollback or future features
]);

const upload_item_disabled = (req, res, next) => {
  return res
    .status(503)
    .json({ message: "Item upload is temporarily disabled." });
};

const upload_offer_image = multer({ storage: storage }).fields([
  { name: "upload_images", maxCount: 1 }, // Single image for offers
]);

const upload_message_images = multer({ storage: storage }).array(
  "message_images",
  5
); // Max 5 images per message

const rollbackUpload = async (imageUrls) => {
  console.log("Received image URLs:", imageUrls);

  try {
    const publicIds = imageUrls.map((url) => {
      const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
      if (matches && matches[1]) {
        return matches[1]; // Return the public_id part
      }
      console.error(`Failed to extract public_id from URL: ${url}`);
      throw new Error("Invalid Cloudinary URL");
    });

    console.log("Extracted public_ids:", publicIds);

    await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          console.log(`Attempting to delete public_id: ${publicId}`);
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted public_id: ${publicId}`, result);
        } catch (error) {
          console.error(`Error deleting public_id: ${publicId}`, error);
        }
      })
    );

    console.log("All image deletions attempted.");
  } catch (error) {
    console.error("Error during Cloudinary rollback:", error);
  }
};

const uploadEvidence = multer({ storage: storage }).array("evidence");

module.exports = {
  upload_prof,
  upload,
  upload_item,
  upload_offer_image,
  upload_item_disabled,
  rollbackUpload,
  upload_message_images,
  uploadEvidence,
};
