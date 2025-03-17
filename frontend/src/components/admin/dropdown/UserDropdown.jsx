import React from "react";
import UserIcon from "../../../assets/images/icons/user.svg";
import MyRentalsIcon from "../../../assets/images/icons/rental.svg";
import MyItemsIcon from "../../../assets/images/icons/item.svg";
import MyPostsIcon from "../../../assets/images/icons/post.svg";
import LogoutIcon from "../../../assets/images/icons/logout.svg";
import "./style.css";

const UserDropdown = ({
  showDropdown,
  toggleDropdown,
  handleClick,
  handleLogout,
  adminUser,
}) => {
  return (
    <div className="nav-item">
      <a className="icon-link" href="#" onClick={toggleDropdown}>
        <img src={UserIcon} alt="User Icon" className="user-icon" />
      </a>

      {showDropdown && (
        <div className="admin-menu">
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
            <button className="close-btn" onClick={toggleDropdown}>
              &times; {/* Close icon */}
            </button>
          </div>
          <div className="dropdown-content">
            {/* <button
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
            </button> */}
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
