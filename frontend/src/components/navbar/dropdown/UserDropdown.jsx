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

  console.log(user);
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
              <div className="dropdown-header p-3 bg-white rounded shadow-sm">
                {/* Close Button - styled as a proper dismissal button */}
                <button
                  className="btn-close position-absolute top-0 right-1 end-0 mt-1 me-1"
                  onClick={toggleDropdown}
                  aria-label="Close"
                ></button>
                <div className="d-flex align-items-center position-relative pt-2">
                  {/* Profile Image - with Bootstrap image styling */}
                  <img
                    src={
                      user?.student?.profilePic
                        ? user?.student?.profilePic
                        : icon
                    }
                    alt="User"
                    className="rounded-circle border border-2 border-light shadow-sm me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />

                  {/* Profile Info */}
                  <div className="profile-info flex-grow-1">
                    {errorFetchUser ? (
                      <p className="text-danger small mb-0">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {errorFetchUser}
                      </p>
                    ) : (
                      <>
                        <h5
                          className="fw-bold text-truncate"
                          style={{ maxWidth: "142px" }}
                        >
                          {user?.user.fname || "First Name"}{" "}
                          {user?.user.lname || "Last Name"}
                        </h5>
                        <a
                          href="/profile/dashboard"
                          className="text-decoration-none text-primary small fw-semibold"
                        >
                          <i className="bi bi-person-badge me-1"></i>
                          View Profile
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="dropdown-content">
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/dashboard");
                    toggleDropdown();
                  }}
                >
                  <h6>Dashboard</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/my-listings");
                    toggleDropdown();
                  }}
                >
                  <h6>My Listings</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/my-for-sale");
                    toggleDropdown();
                  }}
                >
                  <h6>My Items For Sale</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/my-posts");
                    toggleDropdown();
                  }}
                >
                  <h6>My Posts</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/transactions/renter/requests");
                    toggleDropdown();
                  }}
                >
                  <h6>Transactions</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    navigate("/profile/reviews");
                    toggleDropdown();
                  }}
                >
                  <h6>Reviews</h6>
                </button>
                <button
                  className="dropdown-btn"
                  onClick={() => {
                    toggleDropdown();
                    handleLogout();
                  }}
                >
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
