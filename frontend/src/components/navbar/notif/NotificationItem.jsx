import React from "react";
import { formatDistanceToNow } from "date-fns";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import NotificationMessage from "./notificationMessage";

const NotificationItem = ({ notif, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onClick(notif);
  };

  return (
    <a
      href="#"
      key={notif.id}
      className={`notification-item ${notif.is_read ? "read" : "unread"}`}
      onClick={handleClick}
    >
      <img
        src={notif?.sender?.student?.profile_pic || UserIcon}
        className="notification-avatar"
        alt="User Avatar"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = UserIcon;
        }} // Fallback if profile pic fails
      />
      <div className="notification-content">
        <NotificationMessage message={notif.message} type={notif.type} />
        <span className="time">
          {notif.createdAt &&
            formatDistanceToNow(new Date(notif.createdAt), {
              addSuffix: true,
            })}
        </span>
      </div>
    </a>
  );
};

export default NotificationItem;
