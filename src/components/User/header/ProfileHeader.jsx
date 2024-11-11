import React, { useEffect, useState } from "react";
import profilePhoto from "../../../assets/images/icons/user-icon.svg";
import editIcon from "../../../assets/images/icons/edit.png";
import "./profileHeaderStyles.css";
import FetchUserInfo from "../../../utils/FetchUserInfo";
import { formatDate } from "../../../utils/dateFormat";
import { useLocation, useNavigate } from "react-router-dom";

const ProfileHeader = ({ userId, isProfileVisit, selectedOption, onOptionChange }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ user: {}, student: {} });

  const { user, student, errorMessage: fetchErrorMessage } = FetchUserInfo({ userId });
  const [errorMessage, setErrorMessage] = useState(fetchErrorMessage);

  useEffect(() => {
    if (user.user_id && student.college) {
      setUserInfo({ user, student });
      setErrorMessage(errorMessage);
    }
  }, [user, student]);

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
        return "var(--clr-primary)";
    }
  };

  const handleEditButton = () => {
    navigate("/profile/edit-profile");
  };

  const [isTransactionPage, setTransactionPage] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/profile/transactions") {
      setTransactionPage(true);
    } else {
      setTransactionPage(false);
    }
  }, [location.pathname]);

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
              <h4 className="text-white">
                {userInfo.user.first_name} {userInfo.user.last_name || "User Name"}
              </h4>
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
          {isProfileVisit ? (
            <div>
              <button className="btn btn-rectangle secondary white my-2">
                <img src={editIcon} alt="Message button" />
                Message
              </button>
            </div>
          ) : (
            <div>
              <button className="btn btn-rectangle secondary white my-2" onClick={handleEditButton}>
                <img src={editIcon} alt="Edit" />
                Edit
              </button>
            </div>
          )}
        </div>
        {isTransactionPage && (
          <div className="select-option">
            <span className="text-white mx-3">As {selectedOption === "Owner" ? "an" : "a"}</span>
            <select value={selectedOption} onChange={(e) => onOptionChange(e.target.value)}>
              <option value="Renter">Renter</option>
              <option value="Owner">Owner</option>
              <option value="Seller">Seller</option>
              <option value="Buyer">Buyer</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
