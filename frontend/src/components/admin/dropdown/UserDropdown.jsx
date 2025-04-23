import React, { useRef, useEffect } from "react";
import UserIcon from "../../../assets/images/icons/user.png";
import LogoutIcon from "../../../assets/images/icons/logout.svg";
import "./style.css";

const UserDropdown = ({
  showDropdown,
  toggleDropdown,
  handleLogout,
  adminUser,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".icon")
      ) {
        if (showDropdown) toggleDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, toggleDropdown]);

  return (
    <div className="nav-item">
      <a
        className="icon"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleDropdown();
        }}
      >
        <img src={UserIcon} alt="User Icon" className="user-icon" />
      </a>

      {showDropdown && (
        <div className="admin-menu" ref={dropdownRef}>
          <div className="triangle"></div>
          <div className="dropdown-header">
            <img src={UserIcon} alt="User" className="profile-img" />
            <div className="profile-info">
              <h5>
                {adminUser
                  ? `${adminUser.firstName} ${adminUser.lastName}`
                  : "Loading..."}
              </h5>
            </div>
            <button
              className="close-btn"
              onClick={toggleDropdown}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <div className="dropdown-content">
            <button
              className="dropdown-btn"
              onClick={() => {
                toggleDropdown();
                handleLogout();
              }}
            >
              <div className="icon">
                <img src={LogoutIcon} alt="Logout" />
              </div>
              <h6>Logout</h6>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
