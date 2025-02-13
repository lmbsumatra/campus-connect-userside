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

const UserProfileVisit = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // User ID from URL params
  const location = useLocation();
  const dispatch = useDispatch();
  

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/user/${id}?tab=${tab.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <div className="container-content">
      <div className="profile-container d-flex flex-column gap-3">
        <ProfileHeader userId={id} isProfileVisit={true} className="m-0 p-0" />
        <div className="prof-content-wrapper bg-white rounded p-3">
          <div className="profile-content">
            <div className="filter-bttns">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  className={`filter-bttn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>

            {activeTab === "listings" && (
              <>
                <p>Listings content...</p>
                <ItemCard items={availableListingsByUser} />
              </>
            )}

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
                {loadingAvailableItemsForSaleByUser ? (
                  <p>Loading items...</p>
                ) : errorAvailableItemsForSaleByUser ? (
                  <p>Error loading items: {errorAvailableItemsForSaleByUser}</p>
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
