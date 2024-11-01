import React, { useState } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../../assets/images/icons/user-icon.svg";
import ProductCard from "./ProductCard";

const messages = [
  {
    userName: "User name 1",
    preview: "Message preview...",
    date: "Date",
    messages: [
      { sender: "User name 1", time: "7:34", content: "Message preview..." },
      { sender: "User name 2", time: "7:35", content: "Message preview..." },
    ],
  },
  {
    userName: "User name 2",
    preview: "Message preview...",
    date: "Date",
    messages: [
      { sender: "User name 2", time: "7:36", content: "Message preview..." },
      { sender: "User name 1", time: "7:37", content: "Message preview..." },
    ],
  },
];

const MessagePage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  // Add event listener for window resize
  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="container-content message-page">
      <div className="message-content">
      <div className={`inbox ${isMobile && activeChat !== null ? 'd-none' : ''}`}>
          <h3>Messages</h3>
          {messages.map((chat, index) => (
            <div
              key={index}
              className="inbox-item"
              onClick={() => setActiveChat(chat)}
            >
              <img src={UserIcon} alt="User Icon" className="user-icon" />
              <div className="message-info">
                <h5>{chat.userName}</h5>
                <p>{chat.preview}</p>
              </div>
              <span>{chat.date}</span>
            </div>
          ))}
        </div>
        {activeChat && (
          <div className="chat-box">
            <div className="chat-header">
              <button className="back-button" onClick={() => setActiveChat(null)}>
                Back
              </button>
              <h4>{activeChat.userName}</h4>
            </div>
            <div className="chat-content">
              {activeChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    message.sender === activeChat.userName ? "received" : "sent"
                  }`}
                >
                  <p>{message.content}</p>
                  <span>{message.time}</span>
                </div>
              ))}
              <ProductCard />
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Type a message..." />
              <button>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
