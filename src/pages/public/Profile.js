import React, { useState, useEffect } from "react";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import NavBar from "../../components/navbar/navbar/NavBar.jsx";
import StarRating from "../../components/Rating/StarRating.jsx";
import { items } from "../../components/itemlisting/data.jsx";
import Footer from "../../components/footer/Footer";
import UserItemList from "../../components/User/LendersPOV/UserItemList.jsx";
import TransactionsTable from "../../components/User/LendersPOV/Transactions.jsx";
import ProfileSidebar from "../../components/User/sidebar/ProfileSidebar.jsx";

// MyRentals
import RentalFilters from "../../components/myrentals/RentalFilters";
import RentalItem from "../../components/myrentals/RentalItem";
import { rentalItems, filterOptions } from "../../components/myrentals/data";
import ReviewModal from "../../components/modalReview/ReviewModal";

// Import the EditProfile component
import EditProfile from "../../components/editprofile/EditProfile.jsx";
import ProfileHeader from "../../components/User/header/ProfileHeader.jsx";
import BorrowingPost from "../../components/borrowingposts/BorrowingPost.jsx";
import ItemList from "../../components/itemlisting/ItemList.jsx";

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
          .filter(
            (item) =>
              activeFilter === "All" ||
              item.status === activeFilter ||
              (activeFilter === "Request" && item.status === "Pending")
          )
          .map((item) => (
            <RentalItem key={item.id} item={item} onOpenModal={openModal} />
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
            ownerName: "Owner name", // Placeholder, replace with actual data
          }}
        />
      )}
    </div>
  );
}

function Transactions() {
  return <TransactionsTable />;
}

function MyListings() {
  return <ItemList items={items} />;
}

function MyPosts() {
  const [borrowingPosts, setBorrowingPosts] = useState([]);
  useEffect(() => {
    fetch("/Posts.json")
      .then((response) => response.json())
      .then((data) => setBorrowingPosts(data.borrowingPosts));
  }, []);
  return <BorrowingPost borrowingPosts={borrowingPosts} title="" />;
}

function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div className="custom-container d-flex gap-3">
      {!isLoggedIn ? (
        <ProfileSidebar className="profile-sidebar m-0 p-0 lh-0 bg-dark h-100" />
      ) : (
        <></>
      )}

      <div className="profile-content m-0 p-0 lh-0 w-50 ">
        <ProfileHeader className="m-0 p-0" />
        <div className="m-0 p-0">
          <Routes>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-rentals" element={<MyRentals className="bg-white"/>} />
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
