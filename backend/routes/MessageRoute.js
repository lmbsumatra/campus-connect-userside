const router = require("express").Router();
const Message = require("../models/MessageModel");

//add

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all messages for a specific conversation
router.get("/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;  // Get the conversationId from the URL params
      
      // Query the database using Sequelize's findAll() method
      const messages = await Message.findAll({
        where: {
          conversationId: conversationId  // Filter messages by conversationId
        }
      });
  
      // If no messages are found, return an empty array
      if (messages.length === 0) {
        return res.status(200).json([]);
      }
  
      // Return the messages as a JSON response
      res.status(200).json(messages);
    } catch (err) {
      console.error(err);  // Log the error for debugging
      res.status(500).json({ error: err.message });  // Send a 500 error with the error message
    }
  });
  

module.exports = router;