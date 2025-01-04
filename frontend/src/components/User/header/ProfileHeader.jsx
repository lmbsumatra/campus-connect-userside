import React, { useEffect, useState, useRef } from "react";
import profilePhoto from "../../../assets/images/icons/user-icon.svg";
import editIcon from "../../../assets/images/icons/edit.png";
import "./profileHeaderStyles.css";
import FetchUserInfo from "../../../utils/FetchUserInfo";
import { formatDate } from "../../../utils/dateFormat";
import { useLocation, useNavigate } from "react-router-dom";
import useFetchRentalTransactionsByUserId from "../../../utils/useFetchRentalTransactionsByUserId";
import { fetchUser, updateProfileImage } from "../../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import ShowAlert from "../../../utils/ShowAlert";
import { defaultImages } from "../../../utils/consonants";

const ProfileHeader = ({
  userId,
  isProfileVisit,
  selectedOption,
  onOptionChange,
}) => {
  const navigate = useNavigate();
  const { user, loadingFetchUser, errorFetchUser } = useSelector(
    (state) => state.user
  );
  const fileInputRef = useRef(null);

  // State for profile image
  const [profileImage, setProfileImage] = useState(profilePhoto);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch rental transactions
  const {
    transactions: rentalItems,
    error,
    loading,
  } = useFetchRentalTransactionsByUserId(userId);

  const dispatch = useDispatch();

  useEffect(() => {
    if (userId && !user.user) {
      dispatch(fetchUser(userId));
    }
  }, [userId, dispatch, user.user]);

  const [isHovered, setIsHovered] = useState(false);

  const handleImageClick = () => {
    if (!isProfileVisit) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (event) => {
    ShowAlert(dispatch, "loading", "Uploading profile image...");
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size should be less than 5MB");
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append("profile_pic", file);

    // Dispatch the update action
    try {
      await dispatch(updateProfileImage({ userId, formData })).unwrap();
      ShowAlert(dispatch, "success", "Image Uploaded!");
    } catch (error) {
      ShowAlert(dispatch, "error", error);
    }
  };

  const countTransactions = {
    Renter: 0,
    Owner: 0,
    Seller: 0,
    Buyer: 0,
  };

  if (rentalItems && rentalItems.length > 0) {
    rentalItems.forEach((transaction) => {
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

  return (
    <div className="header-container profile-header">
      <div
        className="profile-banner"
        style={{ background: getBackgroundColor() }}
        
      >
        <div
          className="profile-picture"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="holder"
            style={{
              position: "relative",
              cursor: !isProfileVisit ? "pointer" : "default",
            }}
            onClick={handleImageClick}
          >
            <img
              src={user ? user.student.profilePic : [defaultImages]}
              alt="Profile"
              className="profile-photo"
              style={{ opacity: isUploading ? 0.5 : 1 }}
            />
            {isHovered && !isProfileVisit && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  borderRadius: "50%",
                }}
              >
                {isUploading ? "Uploading..." : "Change Photo"}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
        </div>
        <div>
          {user.user ? (
            <>
              <h4 className="text-white">
                {user.user.fname} {user.user.lname || "User Name"}
              </h4>
              <div className="profile-info d-flex">
                <div className="d-block">
                  <span className="label">College</span>
                  <span className="label">Rating</span>
                  <span className="label">Joined</span>
                </div>
                <div className="d-block">
                  <span className="value">{user.student.college || "N/A"}</span>
                  <span className="value">{user.student.rating || "N/A"}</span>
                  <span className="value">
                    {formatDate(user.user.joinDate) || "N/A"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-white">Loading user info...</p>
          )}
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
                onClick={handleEditButton}
                disabled={location.pathname === "/profile/edit-profile"}
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
              {["Renter", "Owner", "Seller", "Buyer"]
                .sort((a, b) => (a === selectedOption ? -1 : 1))
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
