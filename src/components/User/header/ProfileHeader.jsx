import React, { useEffect, useState } from "react";
import profilePhoto from "../../../assets/images/icons/user-icon.svg";
import editIcon from "../../../assets/images/icons/edit.png";
import "./profileHeaderStyles.css";
import FetchUserInfo from "../../../utils/FetchUserInfo";
import { formatDate } from "../../../utils/dateFormat";
import { useLocation, useNavigate } from "react-router-dom";
import useFetchRentalTransactionsByUserId from "../../../utils/useFetchRentalTransactionsByUserId";

const ProfileHeader = ({
  userId,
  isProfileVisit,
  selectedOption,
  onOptionChange,
}) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ user: {}, student: {} });


  const {
    user,
    student,
    errorMessage: fetchErrorMessage,
  } = FetchUserInfo({
    userId,
  });
  const [errorMessage, setErrorMessage] = useState(fetchErrorMessage);

  // Fetch rental transactions
  const {
    transactions: rentalItems,
    error,
    loading,
  } = useFetchRentalTransactionsByUserId(userId);

  useEffect(() => {
    if (user.user_id && student.college) {
      setUserInfo({ user, student });
      setErrorMessage(errorMessage);
    }
  }, [user, student]);

  const countTransactions = {
    Renter: 0,
    Owner: 0,
    Seller: 0,
    Buyer: 0,
  };

  if (rentalItems && rentalItems.length > 0) {
    rentalItems.forEach((transaction) => {
      // Count transactions for each role
      if (transaction.owner_id === userId) {
        countTransactions.Owner++;
      }
      if (transaction.renter_id === userId) {
        countTransactions.Renter++;
      }
      if (transaction.seller_id === userId) {
        countTransactions.Seller++;
      }
      if (transaction.buyer_id === userId) {
        countTransactions.Buyer++;
      }
    });
  }

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

  const [isExpanded, setIsExpanded] = useState(false);
  const handleDropDown = () => {
    setIsExpanded((prev) => !prev);
  };
  useEffect(() => {
    console.log(isExpanded);
  }, [isExpanded]);

  return (
    <div className="profile-header">
      <div
        className="profile-banner"
        style={{ background: getBackgroundColor() }}
      >
        <div className="profile-picture">
          <div className="holder">
            <img src={profilePhoto} alt="Profile" className="profile-photo" />
          </div>
        </div>
        <div>
          {userInfo.user ? (
            <>
              <h4 className="text-white">
                {userInfo.user.first_name}{" "}
                {userInfo.user.last_name || "User Name"}
              </h4>
              <div className="profile-info d-flex">
                <div className="d-block">
                  <span className="label">College</span>
                  <span className="label">Rating</span>
                  <span className="label">Joined</span>
                </div>
                <div className="d-block">
                  <span className="value">
                    {userInfo.student.college || "N/A"}
                  </span>
                  <span className="value">
                    {userInfo.student.rating || "N/A"}
                  </span>
                  <span className="value">
                    {formatDate(userInfo.user.createdAt) || "N/A"}
                  </span>
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
              <button
                className="btn btn-rectangle secondary white my-2"
                onClick={handleEditButton} disabled={location.pathname === "/profile/edit-profile"}
              >
                <img src={editIcon} alt="Edit" />
                Edit
              </button>
            </div>
          )}
        </div>
        {isTransactionPage && (
          <div className="select-option" onClick={() => handleDropDown()}>
            <span className="text-white mx-3">
              As {selectedOption === "Owner" ? "an" : "a"}
            </span>
            <div className={`custom-dropdown ${isExpanded ? "active" : ""}`}>
              {/* Define the options in an array */}
              {["Renter", "Owner", "Seller", "Buyer"]
                .sort((a, b) => (a === selectedOption ? -1 : 1)) // Sort selected option to the top
                .map((option) => (
                  <div
                    key={option}
                    className={`dropdown-item ${
                      option === selectedOption ? "selected" : ""
                    }`}
                    onClick={() => onOptionChange(option)}
                  >
                    {option}
                    <span
                      className={`transaction-indicator ${
                        !countTransactions[option] ? "not-active" : ""
                      }`}
                    >
                      {countTransactions[option]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
