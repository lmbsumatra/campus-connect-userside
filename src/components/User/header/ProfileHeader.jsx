import React, { useEffect, useState } from "react";
import profilePhoto from "../../../assets/images/icons/user-icon.svg";
import editIcon from "../../../assets/images/icons/edit.png";
import "./profileHeaderStyles.css";
import FetchUserInfo from "../../../utils/FetchUserInfo";
import { formatDate } from "../../../utils/dateFormat";

// Define the fetchUserInfo function here or import it from another file

const ProfileHeader = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Renter");
  const [userInfo, setUserInfo] = useState({ user: {}, student: {} });

  useEffect(() => {
    FetchUserInfo(setUserInfo, setErrorMessage);
  }, []);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const getBackgroundColor = () => {
    switch (selectedOption) {
      case "Renter":
        return "var(--clr-renter)";
      case "Owner":
        return "var(--clr-owner)";
      case "Seller":
        return "var(--clr-seller)";
      case "Buyer":
        return "var(--clr-buyer)";
      default:
        return "transparent";
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-banner" style={{ background: getBackgroundColor() }}>
        <div className="profile-picture">
          <div className="holder">
            <img src={profilePhoto} alt="Profile" className="profile-photo" />
          </div>
        </div>
        <div>
          {userInfo.user ? (
            <>
              <h4 className="text-white">{userInfo.user.first_name} {userInfo.user.last_name || "User Name"}</h4>
              <div className="profile-info d-flex">
                <div className="d-block">
                  <span className="label">College</span>
                  <span className="label">Rating</span>
                  <span className="label">Joined</span>
                </div>
                <div className="d-block">
                  <span className="value">{userInfo.student.college || "N/A"}</span>
                  <span className="value">{userInfo.student.rating || "N/A"}</span>
                  <span className="value">{formatDate(userInfo.user.createdAt) || "N/A"}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-white">Loading user info...</p>
          )}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div>
            <button className="btn btn-rectangle secondary white my-2">
              <img src={editIcon} alt="Edit" />
              Edit
            </button>
          </div>
        </div>
        <div className="select-option">
          <span className="text-white mx-3">As a</span>
          <select value={selectedOption} onChange={handleChange}>
            <option value="Renter">Renter</option>
            <option value="Owner">Owner</option>
            <option value="Seller">Seller</option>
            <option value="Buyer">Buyer</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
