import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import useFetchRentalTransactionsByUserId from "../../utils/useFetchRentalTransactionsByUserId";
import RentalFilters from "../../components/myrentals/RentalFilters";
import RentalItem from "../../components/myrentals/RentalItem";
import { useAuth } from "../../context/AuthContext";

const MyRentals = () => {
  const { studentUser } = useAuth();
  const userId = studentUser.userId;
  const [activeFilter, setActiveFilter] = useState("All");

  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch rental transactions
  const {
    transactions: rentalItems,
    error,
    loading,
  } = useFetchRentalTransactionsByUserId(userId);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const openRentProgress = (rentalId) => {
    navigate(`/rent-progress/${rentalId}`); // Navigate with rental ID
  };

  if (loading) return <p>Loading...</p>;

  const filterOptions = [
    { name: "All", statuses: [] }, // To include all items when "All" is selected
    { name: "Requests", statuses: ["Requested"] },
    { name: "To Hand Over", statuses: ["Accepted"] },
    { name: "To Return", statuses: ["HandedOver"] },
    { name: "Completed", statuses: ["Returned"] },
    { name: "To Review", statuses: ["Completed"] },
    { name: "Cancelled", statuses: ["Cancelled", "Declined"] },
  ];

  const filteredItems = rentalItems.filter(item => {
    if (activeFilter === "All") return true; // Show all items for "All" filter
    const filterOption = filterOptions.find(option => option.name === activeFilter);
    return filterOption && filterOption.statuses.includes(item.status);
  });

  return (
    <div className="container rounded bg-white">
      <div className="my-rentals">
        <RentalFilters
          filterOptions={filterOptions.map(option => option.name)}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
        />
        <div className="rental-items">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} onClick={() => openRentProgress(item.id)}>
                <RentalItem item={item} onButtonClick={(e) => e.stopPropagation()} />
              </div>
            ))
          ) : (
            <p>No transactions available. </p>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default MyRentals;
