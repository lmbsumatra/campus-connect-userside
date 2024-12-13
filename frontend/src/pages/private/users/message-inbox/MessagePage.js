import React, { useEffect, useState, useRef } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../../assets/images/icons/user-icon.svg";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const MessagePage = ({ currentUser }) => {
  const [conversation, setConversation] = useState();
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [newMessage, setNewMessage] = useState("");
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const [isLoading, setIsLoading] = useState(true);

  // Ref to handle auto scroll to bottom when new messages come in
  const chatContentRef = useRef(null);

  // Handle window resize event
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch conversations when userId changes
  useEffect(() => {
    if (!userId) {
      console.log("User ID is missing");
      return;
    }

    const getConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/conversations/` + userId
        );
        setConversation(res.data);
        setIsLoading(false);
      } catch (err) {
        console.log("Error fetching conversations:", err);
      }
    };
    if (userId) {
      getConversations();
    }
  }, [userId]);

  // Fetch new messages for the active chat every 5 seconds
  useEffect(() => {
    if (activeChat) {
      const fetchNewMessages = async () => {
        try {
          const res = await axios.get(
            `http://localhost:3001/api/conversations/${activeChat.id}/messages`
          );
          const newMessages = res.data;

          // Add new messages that aren't already in the active chat
          const updatedMessages = [...activeChat.messages];
          newMessages.forEach((msg) => {
            if (!updatedMessages.some((m) => m.id === msg.id)) {
              updatedMessages.push({ ...msg, isNew: true });
            }
          });

          setActiveChat((prevChat) => ({
            ...prevChat,
            messages: updatedMessages,
          }));

          // Remove the "new" flag after 5 seconds
          setTimeout(() => {
            setActiveChat((prevChat) => ({
              ...prevChat,
              messages: prevChat.messages.map((msg) =>
                msg.isNew ? { ...msg, isNew: false } : msg
              ),
            }));
          }, 5000);
        } catch (err) {
          console.error("Error fetching new messages:", err);
        }
      };

      // Poll for new messages every 5 seconds
      const intervalId = setInterval(fetchNewMessages, 5000);

      return () => clearInterval(intervalId);
    }
  }, [activeChat]);

  // Handle message input change
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const messageData = {
          sender: String(userId),
          text: newMessage.trim(),
        };

        const res = await axios.post(
          `http://localhost:3001/api/conversations/${activeChat.id}/message`,
          messageData
        );

        // Update the active chat with the new message
        setActiveChat((prevChat) => ({
          ...prevChat,
          messages: [...prevChat.messages, res.data],
        }));

        setNewMessage(""); // Clear input field after sending
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  // Handle conversation item click
  const handleConversationClick = (conversation) => {
    setActiveChat(conversation);
  };

  // Scroll to the bottom of the chat content
  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  };

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]); // Whenever activeChat.messages changes, scroll to bottom

  return (
    <div className="container-content message-page">
      <div className="message-content">
        <div
          className={`inbox ${isMobile && activeChat !== null ? "d-none" : ""}`}
        >
          <h3>Messages</h3>
          {conversation ? (
            <>
              <div>
                Conversations Count: {conversation.conversations.length}
              </div>
              {conversation.conversations.length > 0 ? (
                conversation.conversations.map((chat) => {
                  return (
                    <div
                      key={chat.id}
                      className="inbox-item"
                      onClick={() => handleConversationClick(chat)}
                    >
                      <img
                        src={UserIcon}
                        alt="User Icon"
                        className="user-icon"
                      />
                      <div className="message-info">
                        <h5>{chat.otherUser.first_name}</h5>
                        <p>{chat.preview}</p>
                      </div>
                      <span>{chat.date}</span>
                    </div>
                  );
                })
              ) : (
                <p>No conversations available.</p>
              )}
            </>
          ) : (
            <p>Loading conversations...</p>
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
                    className={`chat-message ${message.sender === String(userId) ? "sent" : "received"} ${message.isNew ? "new-message" : ""}`}
                  >
                    <p>{message.text}</p>
                    <span>{message.createdAt}</span>
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
                onChange={handleMessageChange}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
