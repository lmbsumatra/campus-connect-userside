const router = require("express").Router();
const Message = require("../models/MessageModel");

// Add a new message
router.post("/", async (req, res) => {
  try {
    const { conversationId, sender, text, isProductCard, productDetails } = req.body;

    console.log("Incoming Request Body:", req.body); // Log the incoming data

    // Validate the incoming payload
    if (!conversationId || !sender) {
      return res.status(400).json({ error: "Conversation ID and Sender are required." });
    }

    // Handle product card validation
    if (isProductCard && !productDetails) {
      return res.status(400).json({ error: "Product details are required for product cards." });
    }

    // Create the new message
    const newMessage = await Message.create({
      conversationId,
      sender,
      text: isProductCard ? null : text, // Nullify text for product cards
      isProductCard: isProductCard || false,
      productDetails: isProductCard ? productDetails : null,
    });

    res.status(200).json(newMessage);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Failed to save message." });
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
      ], // Include required fields
    });

    // Return the messages or an empty array
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
