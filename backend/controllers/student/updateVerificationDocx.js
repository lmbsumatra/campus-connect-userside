const crypto = require("crypto");
const { models } = require("../../models");
const sequelize = require("../../models").sequelize;
const bcrypt = require("bcrypt");
const { rollbackUpload } = require("../../config/multer");
const transporter = require("../../config/nodemailer");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const TokenGenerator = require("../../middlewares/TokenGenerator.js");

// Backend function to handle updating verification documents
const updateVerificationDocx = async (req, res) => {
  const t = await sequelize.transaction();
  let cloudinaryUrls = [];

  try {
    const userId = req.user.userId; // Get user ID from authentication middleware

    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ message: "At least one document must be provided" });
    }

    // Get existing student record
    const student = await models.Student.findOne({
      where: { user_id: userId },
      transaction: t,
    });

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // Track old files for deletion after successful update
    const oldFiles = [];

    // Prepare update object
    const updateData = {};

    // Handle scanned ID update
    if (req.files.scanned_id && req.files.scanned_id.length > 0) {
      // Keep track of new Cloudinary URL
      cloudinaryUrls.push(req.files.scanned_id[0].path);
      updateData.scanned_id = req.files.scanned_id[0].path;

      // Add old file URL to delete later
      if (student.scanned_id) {
        oldFiles.push(student.scanned_id);
      }
    }

    // Handle photo with ID update
    if (req.files.photo_with_id && req.files.photo_with_id.length > 0) {
      // Keep track of new Cloudinary URL
      cloudinaryUrls.push(req.files.photo_with_id[0].path);
      updateData.photo_with_id = req.files.photo_with_id[0].path;

      // Add old file URL to delete later
      if (student.photo_with_id) {
        oldFiles.push(student.photo_with_id);
      }
    }

    // If no files were actually processed
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid files were uploaded" });
    }

    // Set status to pending for re-verification
    updateData.status = "pending";
    updateData.status_message = "Wait for verfication";

    // Update the student record
    await models.Student.update(updateData, {
      where: { user_id: userId },
      transaction: t,
    });

    // Commit transaction
    await t.commit();

    // Delete old files from Cloudinary after successful transaction
    if (oldFiles.length > 0) {
      try {
        await rollbackUpload(oldFiles);
        console.log("Old verification documents deleted from Cloudinary");
      } catch (error) {
        console.error("Error deleting old verification documents:", error);
        // Don't fail the request if cleanup fails
      }
    }

    // Send success response
    res.status(200).json({
      message: "Verification documents updated successfully.",
      status: "pending",
      statusMsg: "Wait for verfication"
    });
  } catch (error) {
    // Rollback the transaction
    await t.rollback();

    // Rollback uploaded files from Cloudinary
    if (cloudinaryUrls.length > 0) {
      try {
        await rollbackUpload(cloudinaryUrls);
      } catch (rollbackError) {
        console.error("Error rolling back Cloudinary uploads:", rollbackError);
      }
    }

    // Log error and send response
    console.error("Document update error:", {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      message: "Failed to update verification documents.",
      error: error.message,
    });
  }
};

module.exports = updateVerificationDocx;
