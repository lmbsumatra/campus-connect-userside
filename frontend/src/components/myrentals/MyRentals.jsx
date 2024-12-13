import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import useFetchRentalTransactionsByUserId from "../../utils/useFetchRentalTransactionsByUserId";
import RentalFilters from "./RentalFilters";
import RentalItem from "./RentalItem";
import { useAuth } from "../../context/AuthContext";

const MyRentals = ({ selectedOption, selectedTab, onTabChange }) => {
  const { studentUser } = useAuth();
  const userId = studentUser.userId;
  const [activeFilter, setActiveFilter] = useState(selectedTab || "Requests");
  const navigate = useNavigate();

  const {
    transactions: rentalItems,
    error,
    loading,
  } = useFetchRentalTransactionsByUserId(userId);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    onTabChange(filter); // Call handleTabChange when filter is clicked
  };

  const openRentProgress = (rentalId) => {
    navigate(`/rent-progress/${rentalId}`);
  };

  if (loading) return <p>Loading...</p>;

  const filterOptions = [
    { name: "Requests", statuses: ["Requested"] },
    { name: selectedOption === "Owner" ? "To Hand Over" : "To Receive", statuses: ["Accepted"] },
    { name: selectedOption === "Renter" ? "To Return" : "To Receive", statuses: ["HandedOver"] },
    { name: "Completed", statuses: ["Returned"] },
    { name: "To Review", statuses: ["Completed"] },
    { name: "Cancelled", statuses: ["Cancelled", "Declined"] },
  ];

  const filteredItems = rentalItems.filter((item) => {
    if (selectedOption === "Owner" && item.owner_id !== userId) return false;
    if (selectedOption === "Renter" && item.renter_id !== userId) return false;

    if (activeFilter === "All") return true; // Show all items for "All" filter
    const filterOption = filterOptions.find(option => option.name === activeFilter);
    return filterOption && filterOption.statuses.includes(item.status);
  });

  const countByStatus = () => {
    const counts = filterOptions.reduce((acc, option) => {
      const filtered = rentalItems.filter((item) => {
        if (selectedOption === "Owner" && item.owner_id !== userId) return false;
        if (selectedOption === "Renter" && item.renter_id !== userId) return false;
        if (option.statuses.length && !option.statuses.includes(item.status)) return false;
        return true;
      });

      let count = filtered.length;

      if (option.name === "To Review") {
        const reviewedCount = filtered.filter(
          (item) => (userId === item.owner_id && item.owner_confirmed) ||
                    (userId === item.renter_id && item.renter_confirmed)
        ).length;
        count -= reviewedCount;
      }

      let statusColor;
      if (option.name === "To Review" && count === 0) {
        statusColor = "gray";
      } else if (option.name === "Request" && count > 0) {
        statusColor = "orange";
      } else if (option.name === "All" || option.name === "Cancelled") {
        statusColor = "white";
      } else {
        statusColor = filtered.reduce((color, item) => {
          if (
            (selectedOption === "Owner" && item.owner_confirmed) ||
            (selectedOption === "Renter" && item.renter_confirmed) || (option.name === "To Review")
          ) {
            return "orange";
          } else {
            return "red";
          }
        }, "gray");
      }

      acc[option.name] = { count, color: statusColor };
      return acc;
    }, {});

    return counts;
  };

  return (
    <div className="container rounded bg-white">
      <div className="w-100">
        <RentalFilters
          filterOptions={filterOptions.map((option) => option.name)}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
          selectedOption={selectedOption}
          countTransactions={countByStatus()}
          selectedTab={selectedTab}
          onTabChange={onTabChange} // Pass the handleTabChange to RentalFilters
        />
        <div className="rental-items">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} onClick={() => openRentProgress(item.id)}>
                <RentalItem
                  item={item}
                  onButtonClick={(e) => e.stopPropagation()}
                  selectedOption={selectedOption}
                />
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
