import React from "react";
import axios from "axios";
import Bell from "../../../assets/images/icons/notif.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";

const Notification = ({
  showNotifications,
  toggleNotifications,
  notifications,
  setNotifications,
}) => {
  const handleNotificationClick = async (e, notificationId) => {
    e.preventDefault();
    e.stopPropagation();

    if (notificationId) {
      try {
        await axios.put(
          `http://localhost:3001/api/notifications/${notificationId}/read`
        );
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:3001/api/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Helper function to determine notification text
  const getNotificationContent = (notification) => {
    // Handle different notification types
    switch (notification.type) {
      case "new-item-for-sale":
        return (
          <>
            <strong>{notification.ownerName}</strong>
            <em>{notification.message}</em>
          </>
        );
      case "new-post":
        return (
          <>
            <strong>
              {notification.renter?.name || notification.ownerName}
            </strong>
            <em>{notification.message}</em>
          </>
        );
      default:
        return (
          <>
            <strong>
              {notification.ownerName || notification.owner?.name}
            </strong>
            <em>{notification.message}</em>
          </>
        );
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  return (
    <div className="notification-container">
      <a
        className="icon-link"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleNotifications();
        }}
        data-count={unreadCount}
      >
        <img src={Bell} alt="Notification Icon" />
      </a>

      {showNotifications && (
        <div className="notifications">
          <div className="notifications-header">
            <h5>Notifications</h5>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
            <button className="close-btn" onClick={toggleNotifications}>
              ×
            </button>
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <a
                  href="#"
                  key={notification.id}
                  className={`notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                  onClick={(e) => handleNotificationClick(e, notification.id)}
                >
                  <img
                    src={UserIcon}
                    className="notification-avatar"
                    alt="User Avatar"
                  />
                  <div className="notification-content-admin">
                    <p>{getNotificationContent(notification)}</p>
                    <span>
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                </a>
              ))
            ) : (
              <p className="no-notifications">No notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
