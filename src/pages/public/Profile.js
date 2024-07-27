import React from "react";
import UserItemList from "../../components/User/UserItemList";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import NavBar from "../../components/navbar/NavBar";
import Footer from "../../components/footer/Footer";


import item1 from "../../assets/images/item/item_1.jpg";
import ownerImg from "../../assets/images/icons/user-icon.svg";
import profilePhoto from "../../assets/images/icons/user-icon.svg";

const items = [
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
  },
];

function EditProfile() {
  return <div>Edit Profile Content</div>;
}

function MyRentals() {
  return <div>My Rentals Content</div>;
}

function Transactions() {
  return <div>Transactions Content</div>;
}

function MyListings() {
  return <UserItemList items={items} />;
}

function MyPosts() {
  return <div>My Posts Content</div>;
}

function Profile() {
  return (
    <div>
      <NavBar />
      <div className="profile-container">
        <div className="profile-sidebar">
          <ul>
            <li>
              <NavLink to="my-posts" className={({ isActive }) => (isActive ? "active" : "")}>My Posts</NavLink>
            </li>
            <li>
              <NavLink to="my-listings" className={({ isActive }) => (isActive ? "active" : "")}>My Listings</NavLink>
            </li>
            <li>
              <NavLink to="my-rentals" className={({ isActive }) => (isActive ? "active" : "")}>My Rentals</NavLink>
            </li>
            <li>
              <NavLink to="transactions" className={({ isActive }) => (isActive ? "active" : "")}>Transactions</NavLink>
            </li>
            <li>
              <NavLink to="edit-profile" className={({ isActive }) => (isActive ? "active" : "")}>Edit Profile</NavLink>
            </li>
          </ul>
        </div>
        <div className="profile-content-wrapper">
          <div className="profile-header">
            <div className="profile-banner"></div>
            <div className="profile-picture">
              <img src={profilePhoto} alt="Profile" className="profile-photo" />
            </div>
            <div className="profile-info">
              <h1>Khaylle Rosario</h1>
              <p>College: CIT</p>
              <p>Rating: ⭐⭐⭐⭐⭐</p>
              <p>Joined: July 10, 2024</p>
            </div>
            <button className="edit-profile-button">Edit Profile</button>
          </div>
          <div className="profile-content">
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
      <Footer />
    </div>
  );
}

export default Profile;
