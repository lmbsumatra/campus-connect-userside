import React from "react";
import { useSelector } from "react-redux";
import UserIcon from "../../../assets/images/icons/user.svg";
import MyRentalsIcon from "../../../assets/images/icons/rental.svg";
import MyItemsIcon from "../../../assets/images/icons/item.svg";
import MyPostsIcon from "../../../assets/images/icons/post.svg";
import LogoutIcon from "../../../assets/images/icons/logout.svg";
import "./style.css";
import FetchUserInfo from "../../../utils/FetchUserInfo";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";

const UserDropdown = ({
  icon,
  isDarkTheme,
  showDropdown,
  toggleDropdown,
  handleLogout,
}) => {
  const studentUser = useSelector(selectStudentUser);
  const { userId } = studentUser || {};

  // Fetch user information
  const { user, errorMessage: fetchErrorMessage } = FetchUserInfo({ userId });

  return (
    <div className="nav-item">
      {/* Dropdown Trigger */}
      <a
        className={`icon-wrapper ${isDarkTheme ? "dark" : "light"}`}
        href="#"
        onClick={toggleDropdown}
      >
        <img src={icon} alt="User Icon" />
      </a>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="user-menu">
          <div className="triangle"></div>

          {/* User Info Section */}
          <div className="dropdown-header">
            <img src={UserIcon} alt="User" className="profile-img" />
            <div className="profile-info d-flex flex-column gap-1 align-items-start">
              {fetchErrorMessage ? (
                <p className="error-message">{fetchErrorMessage}</p>
              ) : (
                <>
                  <h5>
                    {user?.first_name || "First Name"}{" "}
                    {user?.last_name || "Last Name"}
                  </h5>
                  <h6>
                    <a href="/profile">View Profile</a>
                  </h6>
                </>
              )}
            </div>
            <button className="close-btn" onClick={toggleDropdown}>
              &times; {/* Close icon */}
            </button>
          </div>

          {/* Dropdown Options */}
          <div className="dropdown-content">
            <button
              className="dropdown-btn"
              onClick={() => console.log("My Rentals clicked")}
            >
              <div className="icon">
                <img src={MyRentalsIcon} alt="My Rentals" />
              </div>
              <h6>My Rentals</h6>
            </button>
            <button
              className="dropdown-btn"
              onClick={() => console.log("My Items clicked")}
            >
              <div className="icon">
                <img src={MyItemsIcon} alt="My Items" />
              </div>
              <h6>My Items</h6>
            </button>
            <button
              className="dropdown-btn"
              onClick={() => console.log("My Posts clicked")}
            >
              <div className="icon">
                <img src={MyPostsIcon} alt="My Posts" />
              </div>
              <h6>My Posts</h6>
            </button>
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
