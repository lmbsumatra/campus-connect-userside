const router = require("express").Router();
const Message = require("../models/MessageModel");
const { upload_message_images, rollbackUpload  } = require("../config/multer");
const { models } = require("../models/index");

// Add a new message
router.post("/", async (req, res) => {
  try {
    const { conversationId, sender, text, isProductCard, productDetails } = req.body;

    // console.log("Incoming Request Body:", req.body); // Log the incoming data

    // Validate the incoming payload
    if (!conversationId || !sender) {
      return res.status(400).json({ error: "Conversation ID and Sender are required." });
    }

    // Handle product card validation
    if (isProductCard && !productDetails) {
      return res.status(400).json({ error: "Product details are required for product cards." });
    }

    // Get the conversation to find the recipient
    const conversation = await models.Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Extract members from the conversation
    const members = JSON.parse(conversation.members);
    const recipient = members.find(memberId => memberId !== sender.toString());

    // Check if the sender has blocked the recipient or vice versa
    const senderBlockedRecipient = await models.BlockedUser.findOne({
      where: {
        blocker_id: sender,
        blocked_id: recipient
      }
    });

    const recipientBlockedSender = await models.BlockedUser.findOne({
      where: {
        blocker_id: recipient,
        blocked_id: sender
      }
    });

    if (senderBlockedRecipient) {
      return res.status(403).json({ 
        error: "You have blocked this user. Unblock them to send messages.", 
        isBlocked: true,
        blockedBy: false 
      });
    }

    if (recipientBlockedSender) {
      return res.status(403).json({ 
        error: "You cannot send messages to this user as they have blocked you.", 
        isBlocked: false,
        blockedBy: true 
      });
    }

    // Create the new message
    const newMessage = await Message.create({
      conversationId,
      sender,
      text: isProductCard ? null : text, // Nullify text for product cards
      isProductCard: isProductCard || false,
      productDetails: isProductCard ? productDetails : null,
      images: req.body.images || [], // Add support for image URLs
    });

    res.status(200).json(newMessage);
  } catch (err) {
    // console.error("Error saving message:", err);
    res.status(500).json({ error: "Failed to save message." });
  }
});

// New route to handle image uploads for messages
router.post("/upload-message-images", upload_message_images, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded." });
    }

    // Extract image URLs from the uploaded files
    const imageUrls = req.files.map(file => file.path);
    
    res.status(200).json({ 
      success: true, 
      images: imageUrls 
    });
  } catch (err) {
    // console.error("Error uploading message images:", err);
    
    // Try to rollback uploads if available
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => file.path);
      try {
        await rollbackUpload(imagePaths);
      } catch (rollbackErr) {
        // console.error("Error rolling back uploads:", rollbackErr);
      }
    }
    
    res.status(500).json({ error: "Failed to upload images." });
  }
});

// Get all messages for a specific conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Fetch messages for the conversation
    const messages = await Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]], // Sort messages by creation date
      attributes: [
        "id", 
        "sender", 
        "text", 
        "isProductCard", 
        "productDetails", 
        "createdAt",
        "images",
      ], // Include required fields
    });

    // Return the messages or an empty array
    res.status(200).json(messages);
  } catch (err) {
    // console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
