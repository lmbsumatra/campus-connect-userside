const express = require("express");
const router = express.Router();
const Conversation = require("../models/ConversationModel");
const sequelize = require("../config/database"); // Import sequelize instance from the config file
const Message = require("../models/MessageModel");
const MessageNotification = require("../models/MessageNotificationModel");
const User = require("../models/UserModel"); // Adjust the path if necessary

// add lang

const { models } = require("../models/index");

// New conversation route
router.post("/", async (req, res) => {
  try {
    // Create a new conversation by storing senderId and receiverId
    const savedConversation = await Conversation.create({
      members: [req.body.senderId, req.body.receiverId], // Conversation members
    });

    // Respond with the created conversation
    res.status(200).json(savedConversation);
  } catch (err) {
    // Handle any errors that occur during conversation creation
    res.status(500).json({ error: err.message });
  }
});

// Create a conversation between user and lender
router.post("/createConversation", async (req, res) => {
  const { senderId, ownerId } = req.body; // Extract senderId and ownerId from request body

  try {
    // Check if senderId and ownerId are provided
    if (!senderId || !ownerId) {
      return res
        .status(400)
        .json({ error: "Sender ID and Owner ID are required" });
    }

    // Check if a conversation already exists between the sender and owner
    const existingConversation = await Conversation.findOne({
      where: {
        members: sequelize.literal(
          `JSON_CONTAINS(members, '["${senderId}"]') AND JSON_CONTAINS(members, '["${ownerId}"]')`
        ),
      },
    });

    if (!existingConversation) {
      // If no existing conversation, create a new one
      const newConversation = await Conversation.create({
        members: [String(senderId), String(ownerId)], // Store IDs as strings in the members array
        user_id: senderId, // Mark senderId as the user_id (creator)
      });

      // Respond with the newly created conversation
      return res.status(201).json(newConversation);
    }

    // If conversation already exists, return the existing one
    res.status(200).json(existingConversation);
  } catch (err) {
    // Log and return error message in case of failure
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a conversation between user and renter
router.post("/createConversationPost", async (req, res) => {
  const { senderId, renterId } = req.body; // Extract senderId and ownerId from request body
  // console.log({ senderId, renterId });
  try {
    // Check if senderId and ownerId are provided
    if (!senderId || !renterId) {
      return res
        .status(400)
        .json({ error: "Sender ID and Owner ID are required" });
    }

    // Check if a conversation already exists between the sender and owner
    const existingConversation = await Conversation.findOne({
      where: {
        members: sequelize.literal(
          `JSON_CONTAINS(members, '["${senderId}"]') AND JSON_CONTAINS(members, '["${renterId}"]')`
        ),
      },
    });

    if (!existingConversation) {
      // If no existing conversation, create a new one
      const newConversation = await Conversation.create({
        members: [String(senderId), String(renterId)], // Store IDs as strings in the members array
        user_id: senderId, // Mark senderId as the user_id (creator)
      });

      // Respond with the newly created conversation
      return res.status(201).json(newConversation);
    }

    // If conversation already exists, return the existing one
    res.status(200).json(existingConversation);
  } catch (err) {
    // Log and return error message in case of failure
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a conversation between user and seller
router.post("/createBySeller", async (req, res) => {
  const { senderId, sellerId } = req.body; // Extract senderId and sellerId from request body

  try {
    // Check if senderId and sellerId are provided
    if (!senderId || !sellerId) {
      return res
        .status(400)
        .json({ error: "Sender ID and Seller ID are required" });
    }

    // Check if a conversation already exists between the sender and seller
    const existingConversation = await Conversation.findOne({
      where: {
        members: sequelize.literal(
          `JSON_CONTAINS(members, '["${senderId}"]') AND JSON_CONTAINS(members, '["${sellerId}"]')`
        ),
      },
    });

    if (!existingConversation) {
      // If no existing conversation, create a new one
      const newConversation = await Conversation.create({
        members: [String(senderId), String(sellerId)], // Store IDs as strings in the members array
        user_id: senderId, // Mark senderId as the user_id (creator)
      });

      // Respond with the newly created conversation
      return res.status(201).json(newConversation);
    }

    // If conversation already exists, return the existing one
    res.status(200).json(existingConversation);
  } catch (err) {
    // Log and return error message in case of failure
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations of a user
router.get("/:id", async (req, res) => {
  const userId = req.params.id; // Extract userId from URL parameters

  // Fetch associated student record for the user
  const student = await models.Student.findOne({ where: { user_id: userId } });
  if (!student) {
    console.warn(`Student record not found for user ID: ${userId}`);
    return res.status(404).json({
      message: `Student record not found for user ID: ${userId}`,
    });
  }

  // Validate if userId is provided
  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    // Query the database for all conversations involving the user
    const query = `
          SELECT * 
          FROM Conversations 
          WHERE JSON_CONTAINS(members, '["${userId}"]')
      `;

    // Execute the raw SQL query
    const [conversations, metadata] = await sequelize.query(query);

    // Fetch associated student record for the user
    const student = await models.Student.findOne({
      where: { user_id: userId },
    });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // Fetch user details
    const user = await models.User.findByPk(student.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare response with conversations and additional user data
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
      conversations: await Promise.all(
        conversations.map(async (conversation) => {
          // Parse members to identify the other participant in the conversation
          const members = JSON.parse(conversation.members);
          const otherUserId = members.find((memberId) => memberId !== userId);

          // Fetch other user's details
          const otherUser = await models.User.findByPk(otherUserId);

          // Fetch all messages for the current conversation
          const messages = await models.Message.findAll({
            where: { conversationId: conversation.id },
            order: [["createdAt", "ASC"]], // Sort messages by creation date
          });

          return {
            ...conversation,
            otherUser: {
              user_id: otherUser.user_id,
              first_name: otherUser.first_name,
              middle_name: otherUser.middle_name,
              last_name: otherUser.last_name,
            },
            messages: messages.map((message) => ({
              id: message.id,
              sender: message.sender,
              text: message.text,
              images: message.images,
              isProductCard: message.isProductCard, // Include isProductCard
              productDetails: JSON.parse(message.productDetails), // Include productDetails
              createdAt: message.createdAt,
              updatedAt: message.updatedAt,
            })),
          };
        })
      ),
    };

    // Return the combined user and conversation data
    res.status(200).json(responseData);
  } catch (err) {
    // Log and return error in case of failure
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: err.message });
  }
});

// Handle sending a message in a conversation
router.post("/:conversationId/message", async (req, res) => {
  const { conversationId } = req.params; // Extract conversation ID from URL params
  const { sender, text, isProductCard, productDetails, images  } = req.body; // Extract sender and message text from request body

  try {
    // Ensure the conversation exists before sending a message
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Validate product card data
    if (isProductCard && !productDetails) {
      return res
        .status(400)
        .json({ error: "Product details are required for product cards." });
    }

    // Create the new message for the conversation
    const newMessage = await Message.create({
      conversationId,
      sender: sender,
      text: isProductCard ? null : text,
      isProductCard: isProductCard || false,
      productDetails: isProductCard ? productDetails : null,
      images: images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update the conversation's updatedAt timestamp
    await conversation.update({ updatedAt: new Date() });

    // Respond with the newly created message
    res.status(200).json(newMessage);
  } catch (err) {
    // Log and return error message in case of failure
    res.status(500).json({ error: err.message });
  }
});

// Get all messages in a conversation
router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params; // Get conversation ID from URL params

    // Fetch all messages for the given conversation, ordered by creation date
    const messages = await models.Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      attributes: [
        "id",
        "conversationId",
        "sender",
        "text",
        "isProductCard",
        "productDetails",
        "images",
        "createdAt",
        "updatedAt",
      ], // Ensure these fields are included in the response
    });

    // Return the messages as a JSON response
    res.status(200).json(messages);
  } catch (err) {
    // Log and return error in case of failure
    res.status(500).json({ error: err.message });
  }
});

// Add this new route to get conversations with latest message and unread status
router.get("/preview/:userId", async (req, res) => {
  // console.log("Fetching conversations for user:", req.params.userId);
  try {
    const userId = req.params.userId;

    // Fetch conversations
    const query = `
      SELECT * 
      FROM Conversations 
      WHERE JSON_CONTAINS(members, '["${userId}"]')
      ORDER BY updatedAt DESC; 
    `;
    const [conversations] = await sequelize.query(query);

    // Fetch unread notifications
    const unreadNotifications = await MessageNotification.findAll({
      where: { recipient_id: userId, is_read: false },
      attributes: ["conversation_id"],
      raw: true,
    });
    const unreadConvoIds = new Set(
      unreadNotifications.map((n) => n.conversation_id)
    );

    // Process each conversation
    const processed = await Promise.all(
      conversations.map(async (conv) => {
        const members = JSON.parse(conv.members);
        const otherUserId = members.find((id) => id !== userId);
        const otherUser = await User.findByPk(otherUserId);

        // Get latest message
        const latestMessage = await Message.findOne({
          where: { conversationId: conv.id },
          order: [["createdAt", "DESC"]],
        });

        return {
          id: conv.id,
          otherUser: {
            user_id: otherUser.user_id,
            first_name: otherUser.first_name,
            last_name: otherUser.last_name,
          },
          latestMessage: latestMessage
            ? {
                text: latestMessage.text,
                sender: latestMessage.sender,
                createdAt: latestMessage.createdAt,
                isProductCard: latestMessage.isProductCard,
                images: latestMessage.images,
              }
            : null,
          hasUnread: unreadConvoIds.has(conv.id),
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.status(200).json(processed);
  } catch (err) {
    console.error("Error fetching conversation previews:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

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
