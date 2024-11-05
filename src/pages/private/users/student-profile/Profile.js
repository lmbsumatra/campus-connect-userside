// React Imports
import React, { useState, useEffect } from "react";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import axios from "axios";

// Component Imports
import ProfileSidebar from "../../../../components/User/sidebar/ProfileSidebar.jsx";
import EditProfile from "../../../../components/editprofile/EditProfile.jsx";
import ProfileHeader from "../../../../components/User/header/ProfileHeader.jsx";
import MyRentals from "../../../../components/myrentals/MyRentals.jsx";

// Data Imports
import { useAuth } from "../../../../context/AuthContext.js";
import MyForSale from "./MyForSale.jsx";
import MyPosts from "./MyPosts.jsx";
import MyListings from "./MyListings.jsx";
import MyTransactions from "./MyTransactions.jsx";

function Profile() {
  const { studentUser } = useAuth();

  const { userId } = studentUser || {}; // Safe check for `userId`
  console.log("THIS", userId);
  if (!userId) {
    return <div>Loading user information...</div>; // Handle loading state if no userId
  }
  return (
    <div className="container-content d-flex gap-3">
      {userId && (
        <ProfileSidebar className="profile-sidebar m-0 p-0 lh-0 bg-dark h-100 " />
      )}

      <div className="profile-content m-0 p-0 lh-0 w-50">
        <ProfileHeader userId={userId} className="m-0 p-0" />
        <div className="m-0 p-0">
          <Routes>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="transactions" element={<MyTransactions />} />
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
