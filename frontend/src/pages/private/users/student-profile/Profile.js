import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
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

const Profile = () => {
  const { studentUser } = useAuth();
  const { userId } = studentUser || {};
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("renter");
  const [selectedTab, setSelectedTab] = useState("requests");

  useEffect(() => {
    if (userId) setLoading(false);
  }, [userId]);

  const handleOptionChange = (option) => {
    setSelectedOption(option.toLowerCase());
    navigate(`/profile/transactions/${option.toLowerCase()}/${selectedTab}`);
  };

  const handleTabChange = (newTab) => {
    const path = newTab.toLowerCase() === "transactions"
      ? `/profile/transactions/renter/requests`
      : `/profile/transactions/${selectedOption}/${newTab.toLowerCase()}`;

    setSelectedTab(newTab.toLowerCase());
    navigate(path);
  };

  const getBreadcrumbs = () => {
    const pathToBreadcrumb = {
      "my-posts": "My Posts",
      "my-listings": "My Listings",
      "my-for-sale": "My For Sale Items",
      "dashboard": "Dashboard",
      transactions: "Transactions",
      "edit-profile": "Edit Profile",
    };

    const currentPath = location.pathname;
    const breadcrumb = [
      { label: "Home", href: "/" },
      { label: "Profile", href: "/profile" },
    ];

    Object.keys(pathToBreadcrumb).forEach((key) => {
      if (currentPath.includes(key)) {
        breadcrumb.push({ label: pathToBreadcrumb[key], href: `/profile/${key}` });
      }
    });

    return breadcrumb;
  };

  if (loading) return <div>Loading user information...</div>;

  return (
    <div className="container-content profile-detail">
      <BreadCrumb breadcrumbs={getBreadcrumbs()} />
      <div className="profile-container">
        {userId && <ProfileSidebar />}
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
              path="transactions/:option/:tab"
              element={<MyRentals selectedOption={selectedOption} selectedTab={selectedTab} onTabChange={handleTabChange} />}
            />
            <Route path="dashboard" element={<MyTransactions />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="my-for-sale" element={<MyForSale />} />
            <Route path="/" element={<Navigate to="my-listings" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Profile;
