import "./adminNavBarStyles.css";
import searchIcon from "../../../assets/images/icons/search.svg";
import { useState, useEffect, useRef } from "react";
import UserDropdown from "../dropdown/UserDropdown";
import Notification from "../notif/Notification";
import { useAuth } from "../../../context/AuthContext";

const AdminNavBar = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const {logoutAdmin} =useAuth();

  const userDropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const toggleUserDropdown = () => {
    setShowNotifications(false); // Close notifications if open
    setShowUserDropdown((prev) => !prev);
  };

  const toggleNotifications = () => {
    setShowUserDropdown(false); // Close user dropdown if open
    setShowNotifications((prev) => !prev);
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Add logout logic here
  };

  const handleClickOutside = (event) => {
    if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
      setShowUserDropdown(false);
    }
    if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };

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
      <div>
  <button onClick={() => logoutAdmin()}>logout</button>
</div>

      <div className="toolbar d-flex">
        <div ref={notificationsRef} onClick={toggleNotifications}>
          <Notification showNotifications={showNotifications} />
        </div>
        <div ref={userDropdownRef} onClick={toggleUserDropdown}>
          <UserDropdown
            showDropdown={showUserDropdown}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;
