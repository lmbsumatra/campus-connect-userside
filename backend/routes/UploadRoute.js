const express = require("express");
const router = express.Router();
const { upload_offer_image } = require("../config/multer");

// Change the route path to match your frontend request
router.post('/upload-offer-image', upload_offer_image, async (req, res) => {
  try {
    if (!req.files?.upload_images?.[0]) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    
    res.status(200).json({ 
      urls: [req.files.upload_images[0].path] 
    });
    
  } catch (error) {
    // console.error("Upload error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

module.exports = router;