// UserToolbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const UserToolbar = ({ userInfo, loading }) => {
  if (loading) {
    return <div className="loading-message">Loading user info...</div>; // Show a loading indicator
  }


  return (
    <div className="user-info mt-5 bg-white">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img src={""} alt="Profile" className="profile-pic me-2" />
          <div>
            <a href={``} className="text-dark small text-decoration-none">
              {userInfo.user.first_name || "You"}
            </a>
          </div>
        </div>
        <div className="rating">
          <span>Rating:</span>
          {"★"} {/* You can dynamically render stars here if needed */}
          {"☆"}
        </div>
        <button className="btn btn-rectangle secondary me-2">
          View Listings
        </button>
        <button className="btn btn-rectangle secondary me-2">
          View Profile
        </button>
      </div>
    </div>
  );
};
