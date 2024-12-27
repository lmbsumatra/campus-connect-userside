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

const upload_item = multer({ storage: storage }).array("item_images", 5);

const upload_item_disabled = (req, res, next) => {
  return res
    .status(503)
    .json({ message: "Item upload is temporarily disabled." });
};

const rollbackUpload = async (publicIds) => {
  try {
    await Promise.all(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
    );
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
  }
};

module.exports = {
  upload_prof,
  upload,
  upload_item,
  upload_item_disabled,
  rollbackUpload,
};
