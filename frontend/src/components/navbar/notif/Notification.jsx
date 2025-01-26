import React from "react";
import Bell from "../../../assets/images/icons/notif.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";

const Notification = ({ icon, isDarkTheme, showNotifications, toggleNotifications }) => {
  return (
    <div className="notification-container">
       <a 
        className={`icon-wrapper ${isDarkTheme ? "dark" : "light"}`} 
        href="#" 
        onClick={toggleNotifications}
      >
        <img 
          src={icon} 
          alt="Notification Icon" 
        />
      </a>
      {showNotifications && (
        <div className="notifications-user">
          <div className="notifications-header">
            <h5>Notifications</h5>
            <button className="close-btn" onClick={toggleNotifications}>
              ×
            </button>
          </div>
          <div className="notification-list">
            <a href="#" className="notification-item">
              <img
                src={UserIcon}
                className="notification-avatar"
                alt="User Avatar"
              />
              <div className="notification-content">
                <p>
                  <strong>Hailey Bieber</strong> did something....
                </p>
                <span>3 weeks ago</span>
              </div>
            </a>
            {/* Additional notifications can be added here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
