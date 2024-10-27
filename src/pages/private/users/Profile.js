// React Imports
import React, { useState, useEffect } from "react";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";

// Component Imports
import UserItemList from "../../../components/User/LendersPOV/UserItemList.jsx";
import TransactionsTable from "../../../components/User/LendersPOV/Transactions.jsx";
import ProfileSidebar from "../../../components/User/sidebar/ProfileSidebar.jsx";
import EditProfile from "../../../components/editprofile/EditProfile.jsx";
import ProfileHeader from "../../../components/User/header/ProfileHeader.jsx";
import BorrowingPost from "../../../components/borrowingposts/BorrowingPost.jsx";
import ItemList from "../../../components/itemlisting/ItemList.jsx";
import MyRentals from "../../../components/myrentals/MyRentals.jsx";

// Data Imports
import { items } from "../../../components/itemlisting/data.jsx";

// Component Definitions
function Transactions() {
  return (
    <div className="container rounded bg-white">
      <TransactionsTable />
    </div>
  );
}

function MyListings() {
  return (
    <div className="container rounded bg-white">
      <ItemList items={items} />
    </div>
  );
}

function MyPosts() {
  const [borrowingPosts, setBorrowingPosts] = useState([]);
  useEffect(() => {
    fetch("/Posts.json")
      .then((response) => response.json())
      .then((data) => setBorrowingPosts(data.borrowingPosts));
  }, []);

  return (
    <div className="container rounded bg-white">
      <BorrowingPost borrowingPosts={borrowingPosts} title="" />
    </div>
  );
}

function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="container-content d-flex gap-3">
      {!isLoggedIn ? (
        <ProfileSidebar className="profile-sidebar m-0 p-0 lh-0 bg-dark h-100 " />
      ) : null}

      <div className="profile-content m-0 p-0 lh-0 w-50">
        <ProfileHeader className="m-0 p-0" />
        <div className="m-0 p-0">
          <Routes>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="/" element={<Navigate to="my-listings" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Profile;
