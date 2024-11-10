import React from "react";
import { useNavigate } from "react-router-dom";

const UserToolbar = ({
  userProfilePic,
  user,
  isProfileVisit,
  userRating,
  buttonText1,
  buttonText2,
  activeTab,
  isDisabled,
}) => {
  const navigate = useNavigate();

  const handleNavigateTab = () => {
    let sideBarTab = "";
    switch (activeTab) {
      case "Listings":
        sideBarTab = "my-listings";
        break;
      case "Rentals":
        sideBarTab = "my-rentals";
        break;
      case "Transactions":
        sideBarTab = "transactions";
        break;
      case "Posts":
        sideBarTab = "my-posts";
        break;
      case "For Sale":
        sideBarTab = "my-forsale-items";
        break;
      default:
        sideBarTab = "";
        break;
    }
    const destination = isProfileVisit
      ? `/profile/${sideBarTab}`
      : `/user?userId=${user?.user_id}`;
    navigate(destination, { state: activeTab });
  };
  return (
    <div className="user-info mt-5 bg-white">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img
            src={userProfilePic}
            alt="Profile"
            className="profile-pic me-2"
          />
          <div>
            <a
              href={
                isProfileVisit ? "/profile" : `/user?userId=${user.user_id}`
              }
              className="text-dark small text-decoration-none"
            >
              {user.first_name} {user.last_name}
            </a>
          </div>
        </div>
        <div className="rating">
          <span>Rating:</span>
          {"★".repeat(Math.floor(userRating))}
          {"☆".repeat(5 - Math.floor(userRating))}
        </div>
        <button
          className="btn btn-rectangle secondary me-2"
          disabled={isDisabled}
          onClick={() => handleNavigateTab()}
        >
          {buttonText1}
        </button>
        <button
          className="btn btn-rectangle secondary me-2"
          disabled={isDisabled}
        >
          {buttonText2}
        </button>
      </div>
    </div>
  );
};

export default UserToolbar;
