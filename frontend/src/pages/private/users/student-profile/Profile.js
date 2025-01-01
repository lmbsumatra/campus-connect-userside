import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.js";
import ProfileSidebar from "../../../../components/User/sidebar/ProfileSidebar.jsx";
import EditProfile from "./EditProfile.jsx";
import ProfileHeader from "../../../../components/User/header/ProfileHeader.jsx";
import MyRentals from "../../../../components/myrentals/MyRentals.jsx";
import MyForSale from "./MyForSale.jsx";
import MyPosts from "./MyPosts.jsx";
import MyListings from "./MyListings.jsx";
import MyTransactions from "./MyTransactions.jsx";
import BreadCrumb from "../../../../components/breadcrumb/BreadCrumb.jsx";
import "./profileStyles.css";

function Profile() {
  const { studentUser } = useAuth();
  const { userId } = studentUser || {};
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("currentPage");
  const currentTab = queryParams.get("currentTab");

  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(currentPage || "Renter");
  const [selectedTab, setSelectedTab] = useState(currentTab || "Requests");

  useEffect(() => {
    if (userId) {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (currentPage) {
      setSelectedOption(currentPage);
    }
    if (currentTab) {
      setSelectedTab(currentTab);
    }
  }, [currentPage, currentTab]);

  const handleOptionChange = (option) => {
    navigate(
      `/profile/transactions?currentPage=${option}&currentTab=${selectedTab}`
    );
    setSelectedOption(option);
  };

  const handleTabChange = (newSelectedTab) => {
    navigate(
      `/profile/transactions?currentPage=${selectedOption}&currentTab=${newSelectedTab}`
    );
    setSelectedTab(newSelectedTab);
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Profile", href: "/profile" },
  ];

  const pathToBreadcrumb = {
    "my-posts": { label: "My Posts", href: "/profile/my-posts" },
    "my-listings": { label: "My Listings", href: "/profile/my-listings" },
    "my-forsale-items": {
      label: "My For Sale Items",
      href: "/profile/my-forsale-items",
    },
    "my-rentals": { label: "My Rentals", href: "/profile/my-rentals" },
    transactions: { label: "Transactions", href: "/profile/transactions" },
    "edit-profile": { label: "Edit Profile", href: "/profile/edit-profile" },
  };

  const currentPath = location.pathname;
  const pathKey = Object.keys(pathToBreadcrumb).find((key) =>
    currentPath.includes(key)
  );
  
  if (pathKey) {
    breadcrumbs.push(pathToBreadcrumb[pathKey]);
  }

  if (loading) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="container-content profile-detail">
      <BreadCrumb breadcrumbs={breadcrumbs} />
      <div className="profile-container">
        {userId && (
          <ProfileSidebar />
        )}

        <div className="profile-content">
          <ProfileHeader
            userId={userId}
            isProfileVisit={false}
            selectedOption={selectedOption}
            onOptionChange={handleOptionChange}
          />
            <Routes>
              <Route path="edit-profile" element={<EditProfile />} />
              <Route
                path="transactions"
                element={
                  <MyRentals
                    selectedOption={selectedOption}
                    selectedTab={selectedTab}
                    onTabChange={handleTabChange}
                  />
                }
              />
              <Route path="my-rentals" element={<MyTransactions />} />
              <Route path="my-listings" element={<MyListings />} />
              <Route path="my-posts" element={<MyPosts />} />
              <Route path="my-for-sale" element={<MyForSale />} />
              <Route path="/" element={<Navigate to="my-listings" />} />
            </Routes>
        </div>
      </div>
    </div>
  );
}

export default Profile;
