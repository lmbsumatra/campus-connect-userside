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

function Profile() {
  const { studentUser } = useAuth();
  const { userId } = studentUser || {};
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("renter");
  const [selectedTab, setSelectedTab] = useState("requests");

  useEffect(() => {
    if (userId) {
      setLoading(false);
    }
  }, [userId]);

  const handleOptionChange = (option) => {
    setSelectedOption(option.toLowerCase());
    navigate(`/profile/transactions/${option.toLowerCase()}/${selectedTab}`);
  };

  const handleTabChange = (newSelectedTab) => {
    const path = newSelectedTab.toLowerCase() === "transactions"
      ? `/profile/transactions/renter/requests`
      : `/profile/transactions/${selectedOption}/${newSelectedTab.toLowerCase()}`;

    setSelectedTab(newSelectedTab.toLowerCase());
    navigate(path);
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: "Home", href: "/" },
      { label: "Profile", href: "/profile" },
    ];

    const pathToBreadcrumb = {
      "my-posts": { label: "My Posts", href: "/profile/my-posts" },
      "my-listings": { label: "My Listings", href: "/profile/my-listings" },
      "my-for-sale": { label: "My For Sale Items", href: "/profile/my-for-sale" },
      "dashboard": { label: "Dashboard", href: "/profile/dashboard" },
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

    return breadcrumbs;
  };

  if (loading) {
    return <div>Loading user information...</div>;
  }

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
}

export default Profile;
