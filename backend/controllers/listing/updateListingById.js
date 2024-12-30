const { models } = require("../../models/index");
const multer = require('multer');
const upload = multer().array('item_images'); // Configure multer for multiple files

const updateListingById = async (req, res) => {
  try {
    // Use multer to handle the multipart form data
    upload(req, res, async function(err) {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: "Error uploading files" });
      }

      try {
        // Log raw request body and files
        console.log("Raw request body:", req.body);
        console.log("Files:", req.files);

        // Parse the listing data
        const listingData = req.body.listing 
          ? JSON.parse(req.body.listing)
          : null;

        if (!listingData) {
          return res.status(400).json({ 
            message: "No listing data provided" 
          });
        }

        console.log("Parsed listing data:", listingData);

        // Handle the update logic here
        // ... your database update code ...

        res.status(200).json({ 
          message: "Listing updated successfully",
          listing: listingData 
        });

      } catch (parseError) {
        console.error("Error parsing listing data:", parseError);
        res.status(400).json({ 
          message: "Invalid listing data format" 
        });
      }
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

module.exports = updateListingById;