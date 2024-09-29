import React from 'react';
import MessageIcon from "../../../assets/images/icons/message.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import './style.css';

const Message = ({ showDropdown, toggleDropdown }) => {
  return (
    <li className="nav-item">
      <a className="icon-link" href="#" onClick={toggleDropdown}>
        <img src={MessageIcon} alt="Message Icon" className="message-icon" />
      </a>

      {showDropdown && (
        <div className="message-menu">
          <div className="triangle"></div>
          <div className="menu-header">
            <h5>Inbox</h5>
          </div>
          <div className="menu-content">
            <div className="message-item">
              <img src={UserIcon} alt="User" className="message-img" />
              <div className="message-info">
                <h6>Hailey Bieber</h6>
                <p>Hey, I have a question about...</p>
                <span>2 hours ago</span>
              </div>
            </div>
            <div className="message-item">
              <img src={UserIcon} alt="User" className="message-img" />
              <div className="message-info">
                <h6>John Doe</h6>
                <p>Can we schedule a meetup?</p>
                <span>1 day ago</span>
              </div>
            </div>
            <div className="message-item">
              <img src={UserIcon} alt="User" className="message-img" />
              <div className="message-info">
                <h6>Jane Smith</h6>
                <p>Thank you for the quick response...</p>
                <span>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default Message;
