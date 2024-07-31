import React from 'react';
import Bell from "../../../assets/images/icons/bell-icon.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";

const Notification = ({ showNotifications, toggleNotifications }) => {
  return (
    <li className="nav-item">
      <a className="icon-link" href="#" onClick={toggleNotifications}>
        <img src={Bell} alt="Notification Icon" />
      </a>
      {showNotifications && (
        <div className="notifications">
          <div className="notifications-header">
            <h5>Notifications</h5>
            <button className="close-btn" onClick={toggleNotifications}>×</button>
          </div>
          <div className="notification-list">
            <a href="#" className="notification-item">
              <img src={UserIcon} className="notification-avatar" alt="User Avatar" />
              <div className="notification-content">
                <p><strong>Hailey Bieber</strong> did something....</p>
                <span>3 weeks ago</span>
              </div>
            </a>
            {/* Additional notifications can be added here */}
          </div>
        </div>
      )}
    </li>
  );
};

export default Notification;
