import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.js";
import ProfileSidebar from "../../../../components/User/sidebar/ProfileSidebar.jsx";
import EditProfile from "./EditProfile.jsx";
import ProfileHeader from "../../../../components/User/header/ProfileHeader.jsx";
import MyRentals from "../../../../components/myrentals/MyRentals.jsx";
import MyForSale from "./MyForSale.jsx";
import MyPosts from "./MyPosts.jsx";
import MyListings from "./MyListings.jsx";
import MyTransactions from "./MyTransactions.jsx";

function Profile() {
  const location = useLocation();
  const { studentUser } = useAuth();
  const { userId } = studentUser || {}; // Get userId from auth context

  // Initialize loading state here
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("Renter"); // Default value "Renter"

  useEffect(() => {
    if (userId) {
      setLoading(false); // Once userId is available, stop loading
    }
  }, [userId]); // Only re-run when userId changes

  // Don't return early with loading state. Let the hooks always be called in the same order.
  if (loading) {
    return <div>Loading user information...</div>; // Show loading state if still fetching userId
  }

  const handleOptionChange = (option) => {
    setSelectedOption(option); // Update the selectedOption state
  };

  return (
    <div className="container-content d-flex gap-3">
      {userId && (
        <ProfileSidebar className="profile-sidebar m-0 p-0 lh-0 bg-dark h-100 " />
      )}

      <div className="profile-content m-0 p-0 lh-0 w-50">
        <ProfileHeader
          userId={userId}
          isProfileVisit={false}
          selectedOption={selectedOption} // Pass selectedOption to ProfileHeader
          onOptionChange={handleOptionChange} // Pass handleOptionChange to ProfileHeader
          className="m-0 p-0"
        />
        <div className="m-0 p-0">
          <Routes>
            <Route
              path="edit-profile"
              element={<EditProfile />}
            />
            <Route
              path="transactions"
              element={<MyRentals selectedOption={selectedOption} />} // Pass selectedOption to MyRentals
            />
            <Route path="my-rentals" element={<MyTransactions />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="my-forsale-items" element={<MyForSale />} />
            <Route path="/" element={<Navigate to="my-listings" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Profile;
