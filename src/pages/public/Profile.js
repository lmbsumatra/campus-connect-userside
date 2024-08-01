import React, { useState } from "react";
import UserItemList from "../../components/User/LendersPOV/UserItemList.jsx";
import TransactionsTable from "../../components/User/LendersPOV/Transactions.jsx";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import NavBar from "../../components/navbar/navbar/NavBar.jsx";
import StarRating from "../../components/Rating/StarRating.jsx";
import { items } from "../../components/itemlisting/data.jsx";
import Footer from "../../components/footer/Footer";

//MyRentals
import RentalFilters from "../../components/myrentals/RentalFilters";
import RentalItem from "../../components/myrentals/RentalItem";
import { rentalItems, filterOptions } from "../../components/myrentals/data";
import ReviewModal from "../../components/modalReview/ReviewModal";
import profilePhoto from "../../assets/images/icons/user-icon.svg";



function EditProfile() {
  return <div>Edit Profile Content</div>;
}

function MyRentals() {
  const [activeFilter, setActiveFilter] = useState("Request");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedItem, setSelectedItem] = useState(null);
 
   const handleFilterClick = (filter) => {
     setActiveFilter(filter);
   };
 
   const openModal = (item) => {
     setSelectedItem(item);
     setIsModalOpen(true);
   };
 
   const closeModal = () => {
     setIsModalOpen(false);
     setSelectedItem(null);
   };
 
   return (
     <div className="my-rentals">
       <RentalFilters 
         filterOptions={filterOptions}
         activeFilter={activeFilter}
         onFilterClick={handleFilterClick}
       />
       <div className="rental-items">
         {rentalItems
           .filter((item) => 
             activeFilter === "All" || 
             item.status === activeFilter || 
             (activeFilter === "Request" && item.status === "Pending")
           )
           .map((item) => (
             <RentalItem 
               key={item.id} 
               item={item} 
               onOpenModal={openModal}
             />
           ))}
       </div>
       {selectedItem && (
         <ReviewModal 
           isOpen={isModalOpen} 
           onClose={closeModal} 
           item={{
             ...selectedItem, 
             rentalPeriod: `${selectedItem.requestDate} - ${selectedItem.returnDate}`, 
             rentalRate: "10php", 
             ownerName: "Owner name" // Placeholder, replace with actual data
           }} 
         />
       )}
     </div>
   );
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
      <div className="prof-container profile-page">
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
