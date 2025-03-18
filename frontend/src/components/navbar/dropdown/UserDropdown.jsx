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
import { Navigate, useNavigate } from "react-router-dom";

const UserDropdown = ({
  icon,
  isDarkTheme,
  showDropdown,
  toggleDropdown,
  handleLogout,
}) => {
  const studentUser = useSelector(selectStudentUser);
  const { userId } = studentUser || {};

  const navigate = useNavigate();

  const { user, loadingFetchUser, errorFetchUser } = useSelector(
    (state) => state.user
  );

  return (
    <div className="user-dropdown-container" id="user-dropdown-popup">
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
          {loadingFetchUser ? (
            "Loading"
          ) : (
            <>
              <div className="dropdown-header">
                <img src={UserIcon} alt="User" className="profile-img" />
                <div className="profile-info d-flex flex-column gap-1 align-items-start">
                  {errorFetchUser ? (
                    <p className="error-message">{errorFetchUser}</p>
                  ) : (
                    <>
                      <h5>
                        {user?.user.fname || "First Name"}{" "}
                        {user?.user.lname || "Last Name"}
                      </h5>
                      <h6>
                        <a href="/profile/dashboard">View Profile</a>
                      </h6>
                    </>
                  )}
                </div>
                <button className="close-btn" onClick={toggleDropdown}>
                  &times; {/* Close icon */}
                </button>
              </div>

              <div className="dropdown-content">
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/dashboard");
                    toggleDropdown();
                  }}
                >
                  <div className="icon">
                    <img src={MyRentalsIcon} alt="My Rentals" />
                  </div>
                  <h6>Dashboard</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/my-listings");
                    toggleDropdown();
                  }}
                >
                  <div className="icon">
                    <img src={MyRentalsIcon} alt="My Rentals" />
                  </div>
                  <h6>My Listings</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/my-for-sale");
                    toggleDropdown();
                  }}
                >
                  <div className="icon">
                    <img src={MyItemsIcon} alt="My Items" />
                  </div>
                  <h6>My Items For Sale</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/my-posts");
                    toggleDropdown();
                  }}
                >
                  <div className="icon">
                    <img src={MyPostsIcon} alt="My Posts" />
                  </div>
                  <h6>My Posts</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/transactions/renter/requests");
                    toggleDropdown();
                  }}
                >
                  <div className="icon">
                    <img src={MyPostsIcon} alt="My Posts" />
                  </div>
                  <h6>Transactions</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/reviews");
                    toggleDropdown();
                  }}
                >
                  <div className="icon">
                    <img src={MyPostsIcon} alt="My Reviews" />
                  </div>
                  <h6>Reviews</h6>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
