import React, { useState } from "react";
import "./postStyles.css";
import BorrowingPost from "../../post-card/PostCard.jsx";
import ProfileHeader from "../header/ProfileHeader.jsx";
import useFetchApprovedItemsByUserId from "../../../hooks/useFetchApprovedItemsByUserId.jsx";
import { useLocation, useParams } from "react-router-dom";
import ItemList from "../../item-card/ItemCard.jsx";

const UserProfileVisit = () => {
  const location = useLocation();
  const baseUrl = "http://localhost:3001";
  const { id } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("userId");
  const [activeTab, setActiveTab] = useState(location.state || "Listings");
  const {
    items: listings,
    loading: loadingListings,
    error: errorListings,
  } = useFetchApprovedItemsByUserId(
    `${baseUrl}/listings/all/available/user?userId=${userId}`
  );
  const {
    items: posts,
    loading: loadingPosts,
    error: errorPosts,
  } = useFetchApprovedItemsByUserId(
    `${baseUrl}/posts/all/available/user?userId=${userId}`
  );
  const {
    items: itemsForSale,
    loading: loadingItemsForSale,
    error: errorItemsForSale,
  } = useFetchApprovedItemsByUserId(
    `${baseUrl}/item-for-sale/all/available/user?userId=${userId}`
  );


  return (
    <div className="container-content">
      <div className="profile-container d-flex flex-column gap-3">
        <ProfileHeader
          userId={userId}
          isProfileVisit={true}
          className="m-0 p-0"
        />
        <div className="prof-content-wrapper bg-white rounded p-3">
          <div className="profile-content">
            <div className="filter-bttns">
              <button
                className={`filter-bttn ${
                  activeTab === "Listings" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Listings")}
              >
                Listings ({listings && listings.length})
              </button>
              <button
                className={`filter-bttn ${
                  activeTab === "Posts" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Posts")}
              >
                Posts ({posts && posts.length})
              </button>
              <button
                className={`filter-bttn ${
                  activeTab === "For Sale" ? "active" : ""
                }`}
                onClick={() => setActiveTab("For Sale")}
              >
                For Sale ({itemsForSale && itemsForSale.length})
              </button>
            </div>
            {activeTab === "Listings" && (
              <>
                {loadingListings && <p>Loading...</p>}
                {errorListings && <p>Error fetching listings: </p>}
                <ItemList listings={listings} title="Rent" />
              </>
            )}
            {activeTab === "Posts" && (
              <>
                {loadingPosts && <p>Loading...</p>}
                {errorPosts && <p>Error fetching posts:{errorPosts} </p>}
                <BorrowingPost borrowingPosts={posts} title="Looking for..." />
              </>
            )}
            {activeTab === "For Sale" && (
              <>
                {loadingItemsForSale && <p>Loading...</p>}
                {errorItemsForSale && <p>Error fetching items: </p>}
                <ItemList
                  items={itemsForSale}
                  title="Sell"
                  className="col-md-10"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileVisit;
