import React, { useState } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import NavBar from "../../../components/navbar/navbar/NavBar";
import Footer from "../../../components/footer/Footer";
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
  const [activeChat, setActiveChat] = useState(messages[0]);

  return (
    <>
      <div className="message-page custom-container">
        <div className="message-content">
          <div className="inbox">
            <h3>Messages</h3>
            {messages.map((chat, index) => (
              <div
                key={index}
                className={`inbox-item ${
                  activeChat.userName === chat.userName ? "active" : ""
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <img src="" alt="User Icon" className="user-icon" />
                <div className="message-info">
                  <h5>{chat.userName}</h5>
                  <p>{chat.preview}</p>
                </div>
                <span>{chat.date}</span>
              </div>
            ))}
          </div>
          <div className="chat-box">
            <div className="chat-header">
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
        </div>
      </div>
    </>
  );
};

export default MessagePage;
