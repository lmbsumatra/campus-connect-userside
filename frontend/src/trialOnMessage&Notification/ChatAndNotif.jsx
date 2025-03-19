import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

const ChatAndNotif = () => {
  const { studentUser } = useAuth();  // Always call this first
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const socket = io("http://localhost:3001");

  // Register user with socket server when connected
  useEffect(() => {
    if (!studentUser) return;  // Ensure studentUser is available

    socket.on("connect", () => {
      // console.log("Connected to server, socket id:", socket.id);

      // Register user with server
      const userId = studentUser ? studentUser.userId : null;
      if (userId) {
        socket.emit("registerUser", userId);
      }
    });

    // Get conversations on mount or when studentUser changes
    const getConversations = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/conversations/` + studentUser.userId);
        // console.log("Fetched conversations: ", res.data);

        if (Array.isArray(res.data.conversations)) {
          setConversations(res.data.conversations);
        } else {
          console.error("Expected an array but got:", res.data.conversations);
          setConversations([]);  // Fallback to empty array
        }
        setIsLoading(false);
      } catch (err) {
        // console.log("Error fetching conversations:", err);
        setIsLoading(false);
      }
    };

    if (studentUser) {
      getConversations();
    }

    // Listen for incoming messages
    socket.on("receiveMessage", (messageData) => {
      // console.log("New message received:", messageData);
    });

    return () => {
      socket.off("receiveMessage");  // Cleanup listener on component unmount
    };
  }, [studentUser]);  // Dependency array with studentUser to re-fetch conversations on login

  const sendMessage = (messageText, recipientUserId) => {
    // console.log(messageText, recipientUserId)
    const userId = studentUser ? studentUser.userId : null;
    if (!userId || !messageText.trim() || !recipientUserId) return;  // Prevent sending empty message

    const messageData = {
      text: messageText,
      sender: userId,  // Send the userId as the sender
      recipient: recipientUserId,  // Send the recipient's userId
      conversationId: `${userId}-${recipientUserId}`,  // Add conversation ID to track conversations
      otherUser: { userId: recipientUserId },  // Assuming you have otherUser details
    };

    // Emit message with userId and recipientUserId
    socket.emit("sendMessageToUser", messageData);
    // console.log("Sending message:", messageData);
    setNewMessage("");  // Reset input after sending
  };

  // If studentUser is not loaded yet, show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Conversations</h2>
      {conversations.length === 0 ? (
        <p>No conversations found.</p>
      ) : (
        conversations.map((conversation) => {
          const otherUser = conversation.otherUser;
          const messages = conversation.messages;

          return (
            <div
              key={conversation.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <div>
                <h3>
                  Chat with {otherUser.first_name} {otherUser.last_name}
                </h3>
                {messages.map((msg, index) => (
                  <div key={index} style={{ padding: "5px 0" }}>
                    <strong>{msg.sender}</strong>: {msg.text}
                  </div>
                ))}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Type your message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={() => sendMessage(newMessage, otherUser.user_id)}>
                  Send Message
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatAndNotif;
