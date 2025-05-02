import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Bell from "../../../assets/images/icons/bell.png";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";
import { baseApi } from "../../../utils/consonants";

const Notification = ({
  icon,
  showNotifications,
  toggleNotifications,
  notifications,
  setNotifications,
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (e, notification) => {
    e.preventDefault();
    e.stopPropagation();

    if (notification.id) {
      try {
        // Mark notification as read
        await axios.put(`${baseApi}/api/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id ? { ...notif, isRead: true } : notif
          )
        );

        // Handle navigation based on notification type
        navigateBasedOnType(notification);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const navigateBasedOnType = (notification) => {
    // Close notification panel
    toggleNotifications();

    // Handle navigation based on notification type
    switch (notification.type) {
      case "new-listing":
        navigate("/admin/listings/listing-overview");
        break;
      case "new-post":
        navigate("/admin/posts/post-overview");
        break;
      case "new-item-for-sale":
        navigate("/admin/sales/sales-overview");
        break;
      case "escalated-report":
        navigate("/admin/reports/transaction-reports");
        break;
      case "new-student":
        navigate("/admin/users");
      default:
        console.log("No specific navigation for this notification type");
        break;
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${baseApi}/api/notifications/mark-all-read`);
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
      case "new-listing":
        return (
          <>
            <strong>{notification.ownerName}</strong>
            <em>{notification.message}</em>
          </>
        );
      case "new-student":
        return (
          <>
            <strong>{notification.title}</strong>
            <em>
              <br />
              <strong>{notification.ownerName}</strong>
              {notification.message}
            </em>
          </>
        );
      case "escalated-report":
        return (
          <>
            <strong> Escalated Transaction Report</strong>
            <br />
            <strong>
              {notification.ownerName || notification.owner?.name}
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
        className="icon"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleNotifications();
        }}
        data-count={unreadCount}
      >
        <img src={icon || Bell} alt="Notification Icon" />
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
                  onClick={(e) => handleNotificationClick(e, notification)}
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
