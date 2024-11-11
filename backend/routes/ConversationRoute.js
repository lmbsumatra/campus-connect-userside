const express = require("express");
const router = express.Router();
const Conversation = require("../models/ConversationModel");
const sequelize = require("../config/database");  // Import sequelize instance from the config file


// New conversation
router.post("/", async (req, res) => {
    try {
        const savedConversation = await Conversation.create({
            members: [req.body.senderId, req.body.receiverId],
        });
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get conversations of a user

router.get("/:id", async (req, res) => {
    const userId = req.params.id;  // Get userId from URL params

    if (!userId) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        // Log the user ID for debugging
        console.log(`Fetching conversations for user ID: ${userId}`);

        // Using sequelize.query() to run a raw SQL query
        const query = `
            SELECT * 
            FROM Conversations 
            WHERE JSON_CONTAINS(members, '["${userId}"]')
        `;
        
        // Execute the raw SQL query
        const [conversations, metadata] = await sequelize.query(query);

        // Log the query result for debugging
        console.log(conversations);

        // Return the conversations as a JSON response
        res.status(200).json(conversations);

    } catch (err) {
        // Log the error and return it in the response
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get all conversations
// router.get("/", async (req, res) => {
//     try {
//         // Fetch all conversations from the database (no extra fields)
//         const conversations = await Conversation.findAll({
//             attributes: ['id', 'members', 'createdAt', 'updatedAt']  // Specify only the columns you need
//         });

//         res.status(200).json(conversations);  // Send conversations as JSON response
//     } catch (err) {
//         console.error("Error fetching all conversations:", err);
//         res.status(500).json({ error: err.message });
//     }
// });


module.exports = router;
