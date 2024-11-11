import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import useFetchRentalTransactionsByUserId from "../../utils/useFetchRentalTransactionsByUserId";
import RentalFilters from "../../components/myrentals/RentalFilters";
import RentalItem from "../../components/myrentals/RentalItem";
import { useAuth } from "../../context/AuthContext";

const MyRentals = ({ selectedOption }) => {
  console.log(selectedOption);
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
    { name: selectedOption  === "Owner" ? "To Hand Over" : "To Receive", statuses: ["Accepted"] },
    { name: selectedOption === "Renter" ? "To Return" : "To Receive", statuses: ["HandedOver"] },
    { name: "Completed", statuses: ["Returned"] },
    { name: "To Review", statuses: ["Completed"] },
    { name: "Cancelled", statuses: ["Cancelled", "Declined"] },
  ];

  // Filter the rental transactions based on the selectedOption (owner/renter)
  const filteredItems = rentalItems.filter((item) => {
    // Check if the selected option is for 'owner' or 'renter'
    if (selectedOption === "Owner") {
      // If the user is the owner, filter based on owner_id
      if (item.owner_id !== userId) return false; 
    } else if (selectedOption === "Renter") {
      // If the user is the renter, filter based on renter_id
      if (item.renter_id !== userId) return false;
    }

    // Apply the active filter (e.g., "Requests", "Completed", etc.) on the status
    if (activeFilter === "All") return true; // Show all items for "All" filter
    const filterOption = filterOptions.find((option) => option.name === activeFilter);
    return filterOption && filterOption.statuses.includes(item.status);
  });

  return (
    <div className="container rounded bg-white">
      <div className="my-rentals">
        <RentalFilters
          filterOptions={filterOptions.map((option) => option.name)}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
          selectedOption={selectedOption}
        />
        <div className="rental-items">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} onClick={() => openRentProgress(item.id)}>
                <RentalItem item={item} onButtonClick={(e) => e.stopPropagation()}selectedOption={selectedOption} />
              </div>
            ))
          ) : (
            <p>No transactions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRentals;
