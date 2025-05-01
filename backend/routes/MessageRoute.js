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

    // Ensure we're returning a properly formatted message
    const formattedMessage = {
      ...newMessage.toJSON(),
      images: Array.isArray(newMessage.images) ? newMessage.images : 
              (typeof newMessage.images === 'string' ? 
                JSON.parse(newMessage.images) : [])
    };

    res.status(200).json(formattedMessage);
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
        "offerStatus", // Include the offer status
      ], // Include required fields
    });

    // Format the messages to ensure consistent data types
    const formattedMessages = messages.map(message => {
      const messageData = message.toJSON();
      
      // Ensure images is always an array
      if (typeof messageData.images === 'string') {
        try {
          messageData.images = JSON.parse(messageData.images);
        } catch (e) {
          messageData.images = [];
        }
      } else if (!Array.isArray(messageData.images)) {
        messageData.images = [];
      }
      
      // Ensure productDetails is properly parsed
      if (typeof messageData.productDetails === 'string') {
        try {
          messageData.productDetails = JSON.parse(messageData.productDetails);
        } catch (e) {
          messageData.productDetails = null;
        }
      }
      
      return messageData;
    });

    // Return the formatted messages
    res.status(200).json(formattedMessages);
  } catch (err) {
    // console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// New route to update offer status (accept/reject)
router.post("/:messageId/offer-status", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, userId, recipientId } = req.body;

    // Validate inputs
    if (!messageId || !status || !userId) {
      return res.status(400).json({ error: "Message ID, status, and user ID are required." });
    }

    // Validate status value
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be either 'accepted' or 'rejected'." });
    }

    // Find the message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    // Ensure the message is a product card (offer)
    if (!message.isProductCard) {
      return res.status(400).json({ error: "This message is not an offer." });
    }

    // Update the message status
    await message.update({ offerStatus: status });

    // Return the updated message
    res.status(200).json({ 
      success: true,
      message: "Offer status updated successfully.",
      offerStatus: status,
      messageId: messageId
    });
  } catch (err) {
    console.error("Error updating offer status:", err);
    res.status(500).json({ error: "Failed to update offer status." });
  }
});

module.exports = router;
