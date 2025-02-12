import React, { useEffect, useState, useRef } from "react";
import profilePhoto from "../../../assets/images/icons/user-icon.svg";
import editIcon from "../../../assets/images/icons/edit.png";
import followIcon from "../../../assets/images/icons/follow.svg";
import "./profileHeaderStyles.css";
import FetchUserInfo from "../../../utils/FetchUserInfo";
import { formatDate } from "../../../utils/dateFormat";
import { useLocation, useNavigate } from "react-router-dom";
import useFetchRentalTransactionsByUserId from "../../../utils/useFetchRentalTransactionsByUserId";
import { fetchUser, updateProfileImage } from "../../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import ShowAlert from "../../../utils/ShowAlert";
import { defaultImages } from "../../../utils/consonants";
import { updateUserAction } from "../../../redux/user/userSlice";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";

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
  const studentUser = useSelector(selectStudentUser);
  const loggedInUserId = studentUser?.userId || null;

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
    if (userId && isProfileVisit) {
      dispatch(fetchUser(userId));
    }
  }, [userId, dispatch]);

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
    if (!selectedOption) {
      // Handles cases where selectedOption is undefined, null, or empty string
      return "var(--clr-primary)";
    }
    switch (selectedOption.toLowerCase()) {
      case "renter":
        return "var(--clr-renter)";
      case "owner":
        return "var(--clr-owner)";
      case "seller":
        return "var(--clr-seller)";
      case "buyer":
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
    if (location.pathname.startsWith("/profile/transactions")) {
      setTransactionPage(true);
    } else {
      setTransactionPage(false);
    }
  }, [location.pathname]);

  const [isExpanded, setIsExpanded] = useState(false);
  const handleDropDown = () => {
    setIsExpanded((prev) => !prev);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
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
              src={user ? user?.student?.profilePic : [defaultImages]}
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
            <div className="btn-container">
              <button
                className="btn btn-rectangle primary opac"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(
                    updateUserAction({
                      loggedInUserId: loggedInUserId,
                      otherUserId: userId,
                    })
                  );
                }}
              >
                <svg
                  fill="#ff5400"
                  width="16px"
                  height="16px"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_iconCarrier">
                    <path d="M2.002 27.959c0-0.795 0.597-1.044 0.835-1.154l8.783-4.145c0.63-0.289 1.064-0.885 1.149-1.573s-0.193-1.37-0.733-1.803c-2.078-1.668-3.046-5.334-3.046-7.287v-4.997c0-2.090 3.638-4.995 7.004-4.995 3.396 0 6.997 2.861 6.997 4.995v4.998c0 1.924-0.8 5.604-2.945 7.292-0.547 0.43-0.831 1.115-0.749 1.807 0.082 0.692 0.518 1.291 1.151 1.582l2.997 1.422 0.494-1.996-2.657-1.243c2.771-2.18 3.708-6.463 3.708-8.864v-4.997c0-3.31-4.582-6.995-8.998-6.995s-9.004 3.686-9.004 6.995v4.997c0 2.184 0.997 6.602 3.793 8.846l-8.783 4.145s-1.998 0.89-1.998 1.999v3.001c0 1.105 0.895 1.999 1.998 1.999h21.997v-2l-21.996 0.001v-2.029zM30.998 25.996h-3v-3c0-0.552-0.448-1-1-1s-1 0.448-1 1v3h-3c-0.552 0-1 0.448-1 1s0.448 1 1 1h3v3c0 0.552 0.448 1 1 1s1-0.448 1-1v-3h3c0.552 0 1-0.448 1-1s-0.448-1-1-1z" />
                  </g>
                </svg>
                {user.action}
              </button>
              <button className="btn btn-rectangle secondary opac">
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
              As{" "}
              {capitalizeFirstLetter(selectedOption) === "Owner" ? "an" : "a"}
            </span>
            <div className={`custom-dropdown ${isExpanded ? "active" : ""}`}>
              {["Renter", "Owner", "Seller", "Buyer"]
                .sort((a, b) => (a.toLowerCase() === selectedOption ? -1 : 1))
                .map((option) => (
                  <div
                    key={option}
                    className={`dropdown-item ${
                      option === selectedOption ? "selected" : ""
                    }`}
                    onClick={() => onOptionChange(option.toLowerCase())} // Lowercase the option on change
                  >
                    {capitalizeFirstLetter(option)}{" "}
                    {/* Capitalize first letter for display */}
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
