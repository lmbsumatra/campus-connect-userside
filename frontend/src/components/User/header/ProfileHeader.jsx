import React, { useEffect, useState, useRef } from "react";
import profilePhoto from "../../../assets/images/icons/user-icon.svg";
import editIcon from "../../../assets/images/icons/edit.png";
import "./profileHeaderStyles.css";
import { formatDate } from "../../../utils/dateFormat";
import { useLocation, useNavigate } from "react-router-dom";
import useFetchRentalTransactionsByUserId from "../../../utils/useFetchRentalTransactionsByUserId";
import { fetchUser, updateProfileImage } from "../../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import ShowAlert from "../../../utils/ShowAlert";
import {
  defaultImages,
  Follow,
  FollowBack,
  Following,
  baseApi,
} from "../../../utils/consonants";
import { updateUserActionById } from "../../../redux/user/otherUserSlice";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import { fetchOtherUser } from "../../../redux/user/otherUserSlice";
import { resetFollowState } from "../../../redux/user/otherUserSlice";

const ProfileHeader = ({
  userId,
  isProfileVisit = false,
  selectedOption,
  onOptionChange,
}) => {
  const navigate = useNavigate();
  const { user, loadingFetchUser, errorFetchUser } = useSelector((state) =>
    !isProfileVisit ? state.user : state.otherUser
  );
  const fileInputRef = useRef(null);
  const studentUser = useSelector(selectStudentUser);
  const loggedInUserId = studentUser?.userId || null;
  const [profileImage, setProfileImage] = useState(profilePhoto);
  const [isUploading, setIsUploading] = useState(false);
  const {
    transactions: rentalItems,
    error,
    loading,
  } = useSelector((state) => state.rentalTransactions);
  const dispatch = useDispatch();
  const { loadingFollow, successFollow, errorFollow } = useSelector(
    (state) => state.otherUser
  );

  // Local state to store the last action performed (Followed/Unfollowed)
  const [lastAction, setLastAction] = useState(null);
  const [lastUser, setLastUser] = useState(null);

  const handleFollowAction = (e, user) => {
    e.stopPropagation();

    let action = "";
    if (user.action === Follow) {
      action = "Followed";
    } else if (user.action === Following) {
      action = "Unfollowed";
    } else if (user.action === FollowBack) {
      action = "Followed";
    }

    setLastAction(action); // Save action for later alert
    setLastUser(user); // Save user for later alert

    dispatch(
      updateUserActionById({
        loggedInUserId: loggedInUserId,
        otherUserId: userId,
      })
    );
  };

  useEffect(() => {
    if (successFollow && lastUser) {
      ShowAlert(dispatch, "success", `${lastAction} ${lastUser.user.fname}`);
      dispatch(resetFollowState());
    }
    if (errorFollow) {
      ShowAlert(dispatch, "error", `${errorFollow}`);
      dispatch(resetFollowState());
    }
  }, [successFollow, errorFollow, dispatch, lastAction, lastUser]);

  useEffect(() => {
    if (userId) {
      if (isProfileVisit) {
        dispatch(fetchOtherUser(userId));
      } else {
        dispatch(fetchUser(userId));
      }
    }
  }, [userId, isProfileVisit, dispatch]);

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

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profile_pic", file);

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

  const validStatuses = [
    "Requested",
    "Accepted",
    "Declined",
    "HandedOver",
    "Returned",
  ];

  if (rentalItems && rentalItems.length > 0) {
    rentalItems.forEach((transaction) => {
      if (validStatuses.includes(transaction.tx.status)) {
        // Only proceed if the status is valid
        if (transaction.tx.owner_id === userId) {
          countTransactions.Owner++;
        }
        if (transaction.tx.renter_id === userId) {
          countTransactions.Renter++;
        }
        if (transaction.tx.buyer_id === userId) {
          countTransactions.Buyer++;
        }
      }
    });
  }

  const getBackgroundColor = () => {
    if (!selectedOption) {
      return "var(--clr-primary)";
    }
    switch (selectedOption.toLowerCase()) {
      case "renter":
        return "var(--clr-renter)";
      case "owner":
        return "var(--clr-owner)";
      case "buyer":
        return "var(--clr-buyer)";
      default:
        return "var(--clr-primary)";
    }
  };

  const handleEditButton = () => {
    navigate("/profile/edit-profile");
  };
  const handleFollowingsButton = () => {
    navigate("/profile/followings");
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

  const handleMessageClick = async () => {
    // Try to get the user ID from any available source
    const otherUserId =
      // The viewed user's ID
      user?.user?.user_id ||
      user?.user?.userId ||
      userId ||
      // If we're on our own profile but viewing someone else
      (isProfileVisit ? userId : null);

    if (!loggedInUserId) {
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "You need to be logged in to send messages"
      );
      return;
    }

    if (!otherUserId) {
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Recipient information not available"
      );
      return;
    }

    // Don't allow messaging yourself
    if (otherUserId === loggedInUserId) {
      ShowAlert(dispatch, "info", "Info", "You cannot message yourself");
      return;
    }

    try {
      // Create/get a conversation with the user
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/conversations/createConversation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: loggedInUserId,
            ownerId: otherUserId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create conversation");
      }

      const conversationData = await response.json();

      // Navigate to messages with the conversation already active
      navigate("/messages", {
        state: {
          activeConversationId: conversationData.id,
        },
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        error.message || "Failed to start conversation"
      );
    }
  };

  return (
    <div className="header-container profile-header2">
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "148px", // Adjust size as needed
              height: "148px",
              borderRadius: "50%",
              backgroundColor: user?.student?.profilePic
                ? "transparent"
                : "#ccc", // Default background if no image
            }}
            onClick={handleImageClick}
          >
            {user?.student?.profilePic ? (
              <img
                src={user.student.profilePic}
                alt="Profile"
                className="profile-photo"
                style={{ opacity: isUploading ? 0.5 : 1, borderRadius: "50%" }}
              />
            ) : (
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#fff",
                  textTransform: "uppercase",
                }}
              >
                {user?.user?.fname ? user.user.fname.charAt(0) : "?"}
              </span>
            )}

            {/* Hover effect */}
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
                  fontSize: "14px",
                  fontWeight: "bold",
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
          {user?.user ? (
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
                  <span className="value">{user.user.rating || "N/A"}</span>
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
                  handleFollowAction(e, user);
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
              <button
                className="btn btn-rectangle secondary opac"
                onClick={handleMessageClick}
              >
                <img src={editIcon} alt="Message button" />
                Message
              </button>
            </div>
          ) : (
            <div className="action-btns">
              <button
                className="btn btn-rectangle secondary white my-2"
                onClick={handleEditButton}
                disabled={location.pathname === "/profile/edit-profile"}
              >
                <img src={editIcon} alt="Edit" />
                Edit
              </button>
              <button
                className="btn btn-rectangle secondary white my-2"
                onClick={handleFollowingsButton}
                disabled={location.pathname === "/profile/followings"}
              >
                Followings
              </button>
            </div>
          )}
        </div>
        {isTransactionPage && (
          <div className="select-option" onClick={() => handleDropDown()}>
            <span className="text-white m-3 ">
              As{" "}
              {capitalizeFirstLetter(selectedOption) === "Owner" ? "an" : "a"}
            </span>
            <div className={`custom-dropdown ${isExpanded ? "active" : ""}`}>
              {["Renter", "Owner", "Buyer"]
                .sort((a, b) => (a.toLowerCase() === selectedOption ? -1 : 1))
                .map((option) => (
                  <div
                    key={option}
                    className={`dropdown-item ${
                      option === selectedOption ? "selected" : ""
                    }`}
                    onClick={() => onOptionChange(option.toLowerCase())}
                  >
                    {capitalizeFirstLetter(option)}
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
