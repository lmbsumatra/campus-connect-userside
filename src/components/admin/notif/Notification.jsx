import React from 'react';
import Bell from "../../../assets/images/icons/notif.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";

const Notification = ({ showNotifications, toggleNotifications, notifications }) => {
  const handleNotificationClick = (e) => {
    e.stopPropagation(); // Prevent click from propagating to parent component
    toggleNotifications(); // Toggle the notification state
  };

  return (
    <div className="notification-container">
      <a 
        className="icon-link" 
        href="#" 
        onClick={handleNotificationClick} 
        data-count={notifications.length}  // Set the notification count as data attribute
      >
        <img src={Bell} alt="Notification Icon" />
      </a>

      {showNotifications && (
        <div className="notifications">
          <div className="notifications-header">
            <h5>Notifications</h5>
            <button 
              className="close-btn" 
              onClick={() => { 
                toggleNotifications(); 
              }}
            >
              ×
            </button>
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <a href="#" key={index} className="notification-item">
                  <img src={UserIcon} className="notification-avatar" alt="User Avatar" />
                  <div className="notification-content">
                  <p><strong>{notification.owner.name}</strong> {notification.message}</p>
                  <span>{new Date(notification.timestamp).toLocaleString()}</span>
                  </div>
                </a>
              ))
            ) : (
              <p className="no-notifications">No new notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
