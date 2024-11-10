import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSocket from "../../../hooks/useSocket"; 
import searchIcon from "../../../assets/images/icons/search.svg";
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
  const { logoutAdmin } = useAuth(); 
  const [openPopup, setOpenPopup] = useState(null);

  const notificationsRef = useRef(null); // Define ref for notifications
  const userDropdownRef = useRef(null); // Define ref for user dropdown

  const togglePopup = (popup) => {
    setOpenPopup((prev) => (prev === popup ? null : popup));
  };

  const toggleUserDropdown = () => {
    setShowNotifications(false);
    setShowUserDropdown((prev) => !prev);
  };

  const toggleNotifications = () => {
    setShowUserDropdown(false);
    setShowNotifications((prev) => !prev);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin-login");
  };

  useEffect(() => {
    if (socket) {
      // Emit the 'admin-connect' event to notify the server this admin is connected
      socket.emit("admin-connect");

      // Listen for 'listing notification' from the server
      socket.on("new-listing-notification", (notification) => {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          notification,
        ]);
      });

      // Listen for item-for-sale notification from the server
      socket.on("new-item-for-sale-notification", (notification) => {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          notification,
        ]);
      });

      // Cleanup socket listeners on component unmount
      return () => {
        socket.off("new-listing-notification");
        socket.off("new-item-for-sale-notification");
        socket.disconnect();
      };
    }
  }, [socket]); // Only run effect when the socket is available

  return (
    <div className="nav nav-container">
      <div className="searchbar">
        <input placeholder="Search here..." />
        <img src={searchIcon} alt="Search icon" className="search-icon" />
      </div>
      <div className="toolbar d-flex">
        <div ref={notificationsRef} onClick={toggleNotifications}>
          <Notification
            showNotifications={showNotifications}
            toggleNotifications={toggleNotifications}
            notifications={notifications}
          />
        </div>
        <div ref={userDropdownRef} onClick={toggleUserDropdown}>
          <UserDropdown
            showDropdown={openPopup === "dropdown"}
            toggleDropdown={() => togglePopup("dropdown")}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;
