import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bell from "../../../assets/images/icons/notif.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";

const NotificationMessage = ({ message }) => {
  const formatMessage = (text) => {
    const match = text.match(/(.*?)\swants to rent\s(.*)/);

    if (match) {
      const [_, sender, item] = match;
      return (
        <>
          <span className="font-large">{sender}</span>
          <br />
          <span className="default-text">wants to rent</span>
          <br />
          <span className="item-name">{item}</span>
        </>
      );
    }
    return text;
  };

  return <div className="notification-message">{formatMessage(message)}</div>;
};

const Notification = ({
  icon,
  isDarkTheme,
  showNotifications,
  toggleNotifications,
}) => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const studentUser = useSelector(selectStudentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !studentUser?.userId) return;

    socket.emit("registerUser", studentUser.userId);
    console.log(`✅ Registered user ${studentUser.userId} to socket`);

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/notifications/student/${studentUser.userId}`
        );
        setNotifications(res.data);
        const unread = res.data.filter((notif) => !notif.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    const handleReceiveNotification = (newNotification) => {
      console.log("📩 Real-time notification received:", newNotification);
      setNotifications((prev) => {
        const exists = prev.some((notif) => notif.id === newNotification.id);
        return exists ? prev : [newNotification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("receiveNotification", handleReceiveNotification);

    return () => {
      socket.off("receiveNotification", handleReceiveNotification);
    };
  }, [socket, studentUser]);

  const handleNotificationClick = async (notifId, rentalId) => {
    console.log("🔔 Notification Clicked!"); // ✅ Log when a notification is clicked
    console.log("Notif ID:", notifId);
    console.log("Rental ID:", rentalId); // ✅ Make sure rentalId is being passed

    if (!rentalId) {
      console.error(
        "❌ Rental ID is missing! Cannot scroll to rental request."
      );
      return;
    }
    try {
      await axios.put(
        `http://localhost:3001/api/notifications/student/${notifId}/read`
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notifId ? { ...notif, is_read: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Navigate to the transactions page and pass the rentalId to highlight
      navigate("/profile/transactions/owner/requests", {
        state: { highlight: rentalId },
      });

      console.log("✅ Navigated to rental requests with highlight:", rentalId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/notifications/student/mark-all-read/${studentUser.userId}`
      );
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="notification-container">
      <a
        className={`icon-link ${isDarkTheme ? "dark" : "light"}`}
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
        <div className={`notifications-user ${isDarkTheme ? "dark-mode" : ""}`}>
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
          <div className="notification-list" key={notifications.length}>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <a
                  href="#"
                  key={notif.id}
                  className={`notification-item ${
                    notif.is_read ? "read" : "unread"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNotificationClick(notif.id, notif.rental_id);
                  }}
                >
                  <img
                    src={UserIcon}
                    className="notification-avatar"
                    alt="User Avatar"
                  />
                  <div className="notification-content">
                    <p>
                      <NotificationMessage message={notif.message} />
                    </p>
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </a>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
