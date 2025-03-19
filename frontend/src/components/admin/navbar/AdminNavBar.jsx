import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useSocket from "../../../hooks/useSocket";
import UserDropdown from "../dropdown/UserDropdown";
import Notification from "../notif/Notification";
import { useAuth } from "../../../context/AuthContext";
import "./adminNavBarStyles.css";

const AdminNavBar = () => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socket = useSocket("http://localhost:3001");
  const { adminUser, logoutAdmin } = useAuth();
  const [openPopup, setOpenPopup] = useState(null);
  const notificationsRef = useRef(null);
  const userDropdownRef = useRef(null);

  const togglePopup = (popup) => {
    setOpenPopup((prev) => (prev === popup ? null : popup));
  };

  const toggleUserDropdown = () => {
    setShowNotifications(false);
    setShowUserDropdown((prev) => !prev);
  };

  const toggleNotifications = () => {
    setShowUserDropdown(false);
    setShowNotifications((prevState) => !prevState);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin-login");
  };

  const getFormattedDateTime = () => {
    const currentDate = new Date();
    return currentDate.toLocaleString();
  };
  useEffect(() => {
    // console.log("showNotifications:", showNotifications);
  }, [showNotifications]);

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/notifications"
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      // Emit admin-connect event
      socket.emit("admin-connect");

      // Listen for new notifications
      socket.on("new-listing-notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      socket.on("new-item-for-sale-notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      socket.on("new-post-notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      // Cleanup socket listeners
      return () => {
        socket.off("new-listing-notification");
        socket.off("new-item-for-sale-notification");
        socket.off("new-post-notification");
        socket.disconnect();
      };
    }
  }, [socket]);

  // Function to mark notification as read
  const handleNotificationClick = async (notificationId) => {
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
  };

  return (
    <div className="nav nav-container">
      <div className="admin-info">
        {adminUser ? (
          <>
            <span className="admin-name">{`${adminUser.firstName} ${adminUser.lastName}`}</span>
            <span className="date-time">{getFormattedDateTime()}</span>
          </>
        ) : (
          <span>Loading...</span>
        )}
      </div>

      <div className="toolbar d-flex">
        <div ref={notificationsRef} onClick={toggleNotifications}>
          <Notification
            showNotifications={openPopup === "notifications"}
            toggleNotifications={() => togglePopup("notifications")}
            notifications={notifications}
            setNotifications={setNotifications}
            onNotificationClick={handleNotificationClick}
          />
        </div>
        <div ref={userDropdownRef} onClick={toggleUserDropdown}>
          <UserDropdown
            showDropdown={openPopup === "dropdown"}
            toggleDropdown={() => togglePopup("dropdown")}
            handleLogout={handleLogout}
            adminUser={adminUser}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;
