import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import MessageIcon from "../../../assets/images/icons/message.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";

const Message = ({ showDropdown, toggleDropdown }) => {
  const [notifications, setNotifications] = useState([]);
  const { studentUser } = useAuth();
  const { userId } = studentUser || {};

  useEffect(() => {
    if (userId) {
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
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/notifications/read/${notificationId}`,
        {
          method: "PUT",
        }
      );
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchNotifications();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return (
    <div className="nav-item">
      <a
        className="icon-link"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleDropdown();
        }}
        data-count={notifications.length}
      >
        <img src={MessageIcon} alt="Message Icon" className="message-icon" />
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
                  onClick={() => markAsRead(notif.id)}
                >
                  <img src={UserIcon} alt="User" className="message-img" />
                  <div className="message-info">
                    <h6>New Message</h6>
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
