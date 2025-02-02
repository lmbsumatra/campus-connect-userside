import React, { useEffect, useState } from "react";
import Bell from "../../../assets/images/icons/notif.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";

const Notification = ({
  icon,
  isDarkTheme,
  showNotifications,
  toggleNotifications,
}) => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const studentUser = useSelector(selectStudentUser);

  useEffect(() => {
    if (!socket || !studentUser?.userId) return;

    // Register the user with the socket
    socket.emit("registerUser", studentUser.userId);
    console.log(`✅ Registered user ${studentUser.userId} to socket`);
  }, [socket, studentUser]);

  useEffect(() => {
    if (!studentUser?.userId) return;

    // Fetch notifications on mount
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/notifications/student/${studentUser.userId}`
        );
        setNotifications(res.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Listen for real-time notifications
    if (socket) {
      const handleReceiveNotification = (newNotification) => {
        console.log("New notification received:", newNotification);
        setNotifications((prev) => [newNotification, ...prev]); // Add new notification at the top
      };

      socket.on("receiveNotification", handleReceiveNotification);

      // Cleanup listener when component unmounts
      return () => {
        socket.off("receiveNotification", handleReceiveNotification);
      };
    }
  }, [socket, studentUser]);

  return (
    <div className="notification-container">
      <a
        className={`icon-wrapper ${isDarkTheme ? "dark" : "light"}`}
        href="#"
        onClick={toggleNotifications}
      >
        <img src={icon} alt="Notification Icon" />
      </a>
      {showNotifications && (
        <div className="notifications-user">
          <div className="notifications-header">
            <h5>Notifications</h5>
            <button className="close-btn" onClick={toggleNotifications}>
              ×
            </button>
          </div>
          <div className="notification-list" key={notifications.length}>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <a href="#" key={notif.id} className="notification-item">
                  <img
                    src={UserIcon}
                    className="notification-avatar"
                    alt="User Avatar"
                  />
                  <div className="notification-content">
                    <p>
                      <strong>{notif.message}</strong>
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
