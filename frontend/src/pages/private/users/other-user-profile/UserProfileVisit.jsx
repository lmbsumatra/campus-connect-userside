import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ProfileHeader from "../../../../components/User/header/ProfileHeader.jsx";
import { useDispatch, useSelector } from "react-redux";
import ItemCard from "../../../../components/item-card/ItemCard.jsx";
import PostCard from "../../../../components/post-card/PostCard.jsx";
import { fetchAvailableListingsByUser } from "../../../../redux/listing/availableListingsByUser.js";
import { fetchAvailablePostsByUser } from "../../../../redux/post/availablePostsByUser.js";
import { fetchAvailableItemsForSaleByUser } from "../../../../redux/item-for-sale/availableItemsForSaleByUser.js";
import { fetchUserReviews } from "../../../../redux/transactions/userReview.js"; // Import review thunk
import ReviewCard from "./ReviewCard.jsx"; // Import the new ReviewCard component
import gearIcon from "../../../../assets/images/card/gear.svg";

import axios from "axios";
import ReportModal from "../../../../components/report/ReportModal";
import ShowAlert from "../../../../utils/ShowAlert";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice.js";
import "./UserProfileVisit.css";
import useHandleActionWithAuthCheck from "../../../../utils/useHandleActionWithAuthCheck.jsx";
import handleUnavailableDateError from "../../../../utils/handleUnavailableDateError.js";
import { baseApi } from "../../../../utils/consonants.js";
import { fetchOtherUser } from "../../../../redux/user/otherUserSlice.js";

const UserProfileVisit = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // User ID from URL params
  const location = useLocation();
  const dispatch = useDispatch();
  const [showReportModal, setShowReportModal] = useState(false);
  const studentUser = useSelector(selectStudentUser);
  const loggedInUserId = studentUser?.userId || null;
  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();
  const [hasReported, setHasReported] = useState(false);
  const [entityType, setEntityType] = useState("");
  const { user } = useSelector((state) => state.otherUser);

  const shouldFetch = !user || String(user.user?.id) !== String(id);
  // console.log(user);
  useEffect(() => {
    if (shouldFetch) {
      dispatch(fetchOtherUser(id));
    }
  }, [shouldFetch, dispatch, id]);

  const { availableListingsByUser } = useSelector(
    (state) => state.availableListingsByUser
  );
  const {
    availablePostsByUser,
    loadingAvailablePostsByUser,
    errorAvailablePostsByUser,
  } = useSelector((state) => state.availablePostsByUser);
  const {
    availableItemsForSaleByUser,
    loadingAvailableItemsForSaleByUser,
    errorAvailableItemsForSaleByUser,
  } = useSelector((state) => state.availableItemsForSaleByUser);

  // Reviews state from Redux
  const { userReviews, loadingUserReviews, errorUserReviews } = useSelector(
    (state) => state.userReviews
  );

  // Define available tabs
  const availableTabs = ["listings", "posts", "for-sale", "reviews"];

  // Get the tab parameter from the URL (or default to "listings")
  const [activeTab, setActiveTab] = useState("listings");

  const getDynamicFilterTextColor = () => {
    return "var(--clr-renter-txt)";
  };

  const buttonStyle = {
    color: getDynamicFilterTextColor(),
    "--underline-color": "var(--clr-renter-txt)",
  };

  useEffect(() => {
    dispatch(fetchAvailableListingsByUser(id));
    dispatch(fetchAvailablePostsByUser(id));
    dispatch(fetchAvailableItemsForSaleByUser(id));
    dispatch(fetchUserReviews(id)); // Fetch reviews
  }, [dispatch, id]);

  useEffect(() => {
    const tabFromUrl = new URLSearchParams(location.search).get("tab");
    if (availableTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("listings");
    }
  }, [location.search]);

  useEffect(() => {
    if (loggedInUserId) {
      checkIfReported();
    }
  }, [loggedInUserId, id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/user/${id}?tab=${tab.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const handleReportSubmit = async (reason) => {
    const reportData = {
      reporter_id: loggedInUserId,
      reported_entity_id: id,
      entity_type: "user",
      reason: reason,
    };

    try {
      const response = await axios.post(`${baseApi}/api/reports`, reportData); // API endpoint
      // console.log("Report submitted:", response.data);

      // Update hasReported state
      setHasReported(true);

      // Show success notification instead of alert
      await ShowAlert(
        dispatch,
        "success",
        "Report Submitted",
        "Your report has been submitted successfully."
      );
    } catch (error) {
      console.error("Error submitting report:", error);

      // Handle 403 error separately
      await handleUnavailableDateError(dispatch, error);

      // If it's not a 403 error, handle other errors
      if (error.response?.status !== 403) {
        await ShowAlert(
          dispatch,
          "error",
          "Submission Failed",
          "Failed to submit the report. Please try again."
        );
      }
    }

    setShowReportModal(false); // Close the modal
  };

  const handleReportClick = () => {
    if (loggedInUserId) {
      const entityType = "user"; // You can change this based on which entity is being reported
      setShowReportModal(true);
      setEntityType(entityType);
    } else {
      // If the user is not logged in, use the authentication check
      handleActionWithAuthCheck(
        () => setShowReportModal(true),
        () =>
          ShowAlert(
            dispatch,
            "warning",
            "Action Required",
            "Please login to report this user.",
            {
              text: "Login",
              action: () => {
                navigate("/", {
                  state: { showLogin: true, authTab: "loginTab" },
                });
              },
            }
          )
      );
    }
  };

  const checkIfReported = async () => {
    try {
      const response = await axios.get(`${baseApi}/api/reports/check`, {
        params: {
          reporter_id: loggedInUserId,
          reported_entity_id: id,
        },
      });
      setHasReported(response.data.hasReported);
    } catch (error) {
      console.error("Error checking report:", error);
    }
  };

  return (
    <div className="container-content">
      <div className="profile-container d-flex flex-column gap-3">
        {/* Report Button */}
        {loggedInUserId !== id && !hasReported && (
          <div className="report-button">
            <button className="btn-report" onClick={handleReportClick}>
              ⚠
            </button>
          </div>
        )}
        {hasReported && (
          <div className="report-button">
            <button className="btn btn-rectangle danger" disabled>
              ⚠
            </button>
          </div>
        )}

        {/* Report Modal */}
        <ReportModal
          show={showReportModal}
          handleClose={() => setShowReportModal(false)}
          handleSubmit={handleReportSubmit}
          entityType={entityType}
        />

        <ProfileHeader userId={id} isProfileVisit={true} className="m-0 p-0" />
        <div className="prof-content-wrapper bg-white rounded p-3">
          <div className="profile-content">
            <div className="rental-filters">
              <div className="filter-buttons">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    className={`filter-button ${
                      activeTab === tab ? "active" : ""
                    }`}
                    style={buttonStyle}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab.charAt(0).toUpperCase() +
                      tab.slice(1).replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "listings" ? (
              availableListingsByUser.length > 0 ? (
                <ItemCard items={availableListingsByUser} />
              ) : (
                <p>No listings available</p>
              )
            ) : null}

            {activeTab === "posts" && (
              <>
                {loadingAvailablePostsByUser ? (
                  <p>Loading posts...</p>
                ) : errorAvailablePostsByUser ? (
                  <p>Error loading posts: {errorAvailablePostsByUser}</p>
                ) : (
                  <PostCard
                    borrowingPosts={
                      Array.isArray(availablePostsByUser)
                        ? availablePostsByUser
                        : []
                    }
                  />
                )}
              </>
            )}

            {activeTab === "for-sale" && (
              <>
                {/* Show rep card if the user is a representative */}
                {user?.user?.isRepresentative && user?.user?.organization && (
                  <div className="rep-card bg-light rounded p-3 mb-3 border shadow-sm">
                    <h6 className="mb-2">
                      🔰 {user.user.fname} {user.user.lname} is a representative
                      of:
                    </h6>
                    <div className="d-flex align-items-center gap-3">
                      {user.user.organization.logo && (
                        <img
                          src={user.user.organization.logo || gearIcon}
                          alt="Organization Logo"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                      <div>
                        <strong>{user.user.organization.name}</strong>
                        <p className="mb-0 text-muted">
                          {user.user.organization.description}
                        </p>
                        <small className="text-secondary">
                          Category: {user.user.organization.category?.name}
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* The rest of the items for sale */}
                {loadingAvailableItemsForSaleByUser ? (
                  <p>Loading items...</p>
                ) : errorAvailableItemsForSaleByUser ? (
                  <p>No items available</p>
                ) : (
                  <ItemCard
                    items={
                      Array.isArray(availableItemsForSaleByUser)
                        ? availableItemsForSaleByUser
                        : []
                    }
                  />
                )}
              </>
            )}

            {activeTab === "reviews" && (
              <>
                {loadingUserReviews ? (
                  <p>Loading reviews...</p>
                ) : errorUserReviews ? (
                  <p>Error loading reviews: {errorUserReviews}</p>
                ) : userReviews.length > 0 ? (
                  <ReviewCard reviews={userReviews} />
                ) : (
                  <p>No reviews available.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileVisit;
