import React, { useEffect, useState, useRef } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../../assets/images/icons/user-icon.svg";
import { useAuth } from "../../../../context/AuthContext";
import { io } from "socket.io-client";
import { baseApi } from "../../../../App";

const MessagePage = () => {
  const { studentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [highlightNewMessage, setHighlightNewMessage] = useState(false);
  const chatContentRef = useRef(null);
  const socket = useRef(null);

  const { userId } = studentUser || {};
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userId) return;

    socket.current = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:3001"
    );

    socket.current.on("connect", () => {
      console.log("Connected to WebSocket", socket.current.id);
      socket.current.emit("registerUser", userId);
    });

    socket.current.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      if (activeChat && message.conversationId === activeChat.id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));
        setHighlightNewMessage(true);
        setTimeout(() => setHighlightNewMessage(false), 3000);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [userId, activeChat]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;

      try {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3001"
          }/api/conversations/${userId}`
        );
        const data = await res.json();
        setConversations(data.conversations);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, [userId]);
  
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  const handleSendMessage = async (message, recipientId) => {
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      sender: userId,
      recipient: recipientId,
      text: message,
      conversationId: activeChat.id,
      otherUser: { userId: recipientId },
    };

    try {
      const res = await fetch(
        `${"http://localhost:3001"}/api/conversations/${activeChat.id}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageData),
        }
      );
      const savedMessage = await res.json();

      setActiveChat((prev) => ({
        ...prev,
        messages: [...prev.messages, savedMessage],
      }));

      socket.current.emit("sendMessageToUser", messageData);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleConversationClick = (conversation) => {
    setActiveChat(conversation);
  };

  return (
    <div className="container-content message-page">
      <div className="message-content">
        <div
          className={`inbox ${isMobile && activeChat !== null ? "d-none" : ""}`}
        >
          <h3>Messages</h3>
          {isLoading ? (
            <p>Loading conversations...</p>
          ) : conversations.length > 0 ? (
            conversations.map((chat) => (
              <div
                key={chat.id}
                className="inbox-item"
                onClick={() => handleConversationClick(chat)}
              >
                <img src={UserIcon} alt="User Icon" className="user-icon" />
                <div className="message-info">
                  <h5>{chat.otherUser.first_name}</h5>
                  <p>{chat.preview}</p>
                </div>
                <span>{new Date(chat.date).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p>No conversations available.</p>
          )}
        </div>

        {activeChat && (
          <div className="chat-box">
            <div className="chat-header">
              <button
                className="back-button"
                onClick={() => setActiveChat(null)}
              >
                Back
              </button>
              <h4>{activeChat.otherUser.first_name}</h4>
            </div>
            <div className="chat-content" ref={chatContentRef}>
              {activeChat.messages && activeChat.messages.length > 0 ? (
                activeChat.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      message.sender === userId ? "sent" : "received"
                    } ${
                      highlightNewMessage &&
                      index === activeChat.messages.length - 1
                        ? "new-message"
                        : ""
                    }`}
                  >
                    <p>{message.text}</p>
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                onClick={(e) =>
                  handleSendMessage(newMessage, activeChat.otherUser.user_id)
                }
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
