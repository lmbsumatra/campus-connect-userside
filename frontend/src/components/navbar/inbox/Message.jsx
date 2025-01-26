import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import MessageIcon from "../../../assets/images/icons/message.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";
import { io } from "socket.io-client";
import { useChat } from "../../../context/ChatContext";

const Message = ({ icon, isDarkTheme, showDropdown, toggleDropdown }) => {
  const [notifications, setNotifications] = useState([]);
  const { studentUser } = useAuth();
  const { userId } = studentUser || {};
  const { setActiveChat } = useChat();
  const navigate = useNavigate();
  const socket = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socket.current = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:3001"
    );

    socket.current.on("connect", () => {
      socket.current.emit("registerUser", userId);
    });

    // Listen for badge count updates
    socket.current.on("updateBadgeCount", (count) => {
      console.log("Received badge count update:", count);
      fetchNotifications(); // Refresh notifications when count updates
    });

    // Listen for new messages
    socket.current.on("receiveMessage", (message) => {
      console.log("Received new message in Message.jsx:", message);
      fetchNotifications(); // Refresh notifications when new message arrives
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId]);

  // Fetch notifications when dropdown is toggled
  useEffect(() => {
    if (userId && showDropdown) {
      fetchNotifications();
    }
  }, [userId, showDropdown]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/notifications/unread/${userId}`
      );
      const data = await res.json();
      console.log("Fetched Notifications:", data);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markMessageAsRead = async (notificationId) => {
    try {
      await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/notifications/message/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      // Emit socket event to update badge count
      if (socket.current) {
        socket.current.emit("markMessagesAsRead", {
          userId,
          notificationId,
        });
      }

      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllMessagesAsRead = async () => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/notifications/message/mark-all-read/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark all messages as read: ${response.statusText}`
        );
      }

      // Emit socket event to update badge count
      if (socket.current) {
        socket.current.emit("markMessagesAsRead", {
          userId,
          conversationId: "all",
        });
      }

      fetchNotifications();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.conversation_id) {
      console.error("Conversation ID is undefined!");
      return;
    }

    try {
      await markMessageAsRead(notif.id);

      const [conversationRes, messagesRes] = await Promise.all([
        fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3001"
          }/api/conversations/${notif.conversation_id}`
        ),
        fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3001"
          }/api/messages/${notif.conversation_id}`
        ),
      ]);

      const conversationData = await conversationRes.json();
      const messagesData = await messagesRes.json();

      const fullConversation = {
        ...conversationData,
        messages: messagesData,
        otherUser: notif.sender,
      };

      setActiveChat(fullConversation);
      toggleDropdown();
      navigate(`/messages/${notif.conversation_id}`);
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  return (
    <div className="nav-item">
      <a
        className={`icon-wrapper ${isDarkTheme ? "dark" : "light"}`}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleDropdown();
        }}
      >
        <img src={icon} alt="Message Icon" />
      </a>

      {showDropdown && (
        <div className="message-menu">
          <div className="triangle"></div>
          <div className="menu-header">
            <h5>Inbox</h5>
            <div className="header-actions">
              {notifications.length > 0 && (
                <button
                  className="mark-all-read"
                  onClick={markAllMessagesAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--clr-primary)",
                    cursor: "pointer",
                    marginRight: "10px",
                    fontSize: "14px",
                  }}
                >
                  Mark all as read
                </button>
              )}
              <button
                className="close-btn"
                onClick={toggleDropdown}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "0 5px",
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div className="menu-content">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="message-item"
                  onClick={() => {
                    markMessageAsRead(notif.id);
                    handleNotificationClick(notif);
                  }}
                >
                  <img src={UserIcon} alt="User" className="message-img" />
                  <div className="message-info">
                    <h6>
                      {`${notif.sender?.first_name} ${notif.sender?.last_name}` ||
                        "Unknown Sender"}
                    </h6>
                    <p>{notif.message}</p>
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p
                className="no-notifications"
                style={{ textAlign: "center", padding: "20px" }}
              >
                No new messages
              </p>
            )}
            {notifications.length > 0 && (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <a
                  href="/messages"
                  style={{
                    color: "var(--clr-primary)",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  View All
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
