import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import searchIcon from "../../../assets/images/icons/search.svg";
import UserDropdown from "../dropdown/UserDropdown";
import Notification from "../notif/Notification";
import "./adminNavBarStyles.css";

const AdminNavBar = () => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logoutAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [openPopup, setOpenPopup] = useState(null);
  const socketRef = useRef(null);

  const togglePopup = (popup) => {
    setOpenPopup((prev) => (prev === popup ? null : popup));
  };

  const userDropdownRef = useRef(null);
  const notificationsRef = useRef(null);

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

  const handleClickOutside = (event) => {
    if (
      userDropdownRef.current &&
      !userDropdownRef.current.contains(event.target)
    ) {
      setShowUserDropdown(false);
    }
    if (
      notificationsRef.current &&
      !notificationsRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }
  };

  // Socket connection and event handling
  useEffect(() => {
     // Establish socket connection
    socketRef.current = io("http://localhost:3001");

    // Emit the 'admin-connect' event to notify the server this admin is connected
    socketRef.current.emit("admin-connect");

    // Listen for 'listing notification' from the server
    socketRef.current.on("new-listing-notification", (notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });
    // Listen for item-for-sale notification from the server
    socketRef.current.on("new-item-for-sale-notification", (notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
