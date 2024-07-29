import React from "react";
import UserItemList from "../../components/User/UserItemList";
import TransactionsTable from "../../components/User/Transactions";  
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import NavBar from "../../components/navbar/NavBar";
import Footer from "../../components/footer/Footer";

import item1 from "../../assets/images/item/item_1.jpg";
import ownerImg from "../../assets/images/icons/user-icon.svg";
import profilePhoto from "../../assets/images/icons/user-icon.svg";

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star-icon ${star > rating ? 'empty' : ''}`}>
          <i className="fa-solid fa-star"></i>
        </span>
      ))}
    </div>
  );
};

const items = [
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 4,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 5,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 3,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 2,
  },
];

function EditProfile() {
  return <div>Edit Profile Content</div>;
}

function MyRentals() {
  return <div>My Rentals Content</div>;
}

function Transactions() {
  return <TransactionsTable />;  // Use the TransactionsTable component
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
              <h2>Elisa Manuel</h2>
              <div className="profile-details">
                <div>
                  <span className="profile-label">College</span>
                  <span className="profile-value">CIT</span>
                </div>
                <div>
                  <span className="profile-label">Rating</span>
                  <span className="profile-value">
                    <StarRating rating={4} /> 
                  </span>
                </div>
                <div className="profile-bio">
                  <span className="profile-label">Bio</span>
                  <span className="profile-value">This is a placeholder for the bio section.</span>
                </div>
                <div>
                  <span className="profile-label">Joined</span>
                  <span className="profile-value">July 10, 2024</span>
                </div>
              </div>
              <button className="edit-profile-button">Edit Profile</button>
            </div>
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
