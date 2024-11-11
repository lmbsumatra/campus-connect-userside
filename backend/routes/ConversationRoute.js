const express = require("express");
const router = express.Router();
const Conversation = require("../models/ConversationModel");
const sequelize = require("../config/database");  // Import sequelize instance from the config file

// add lang

const {models} = require("../models/index")
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

    // Check if userId is provided
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
        console.log("Conversations fetched:", conversations);

        // Check for student record
        const student = await models.Student.findOne({ where: { user_id: userId } });
        if (!student) {
            return res.status(404).json({ message: "Student record not found" });
        }

        // Fetch user details based on student record
        const user = await models.User.findByPk(student.user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare response data with conversations and their messages
        const responseData = {
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
            },
            student: {
                tup_id: student.tup_id,
                college: student.college,
            },
            conversations: await Promise.all(conversations.map(async (conversation) => {
                // Parse the members to find the other user
                const members = JSON.parse(conversation.members);
                const otherUserId = members.find(memberId => memberId !== userId);

                // Fetch the other user's details
                const otherUser = await models.User.findByPk(otherUserId);

                // Fetch messages related to this conversation
                const messages = await models.Message.findAll({
                    where: { conversationId: conversation.id },
                    order: [['createdAt', 'ASC']], // Order messages by creation date
                });

                return {
                    ...conversation,
                    otherUser: {
                        user_id: otherUser.user_id,
                        first_name: otherUser.first_name,
                        middle_name: otherUser.middle_name,
                        last_name: otherUser.last_name,
                    },
                    messages: messages.map(message => ({
                        id: message.id,
                        sender: message.sender,
                        text: message.text,
                        createdAt: message.createdAt,
                    })),
                };
            })),
        };

        // Return the combined user and conversations data as a JSON response
        res.status(200).json(responseData);

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
