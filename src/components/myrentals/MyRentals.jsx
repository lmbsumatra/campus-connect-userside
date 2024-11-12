import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import useFetchRentalTransactionsByUserId from "../../utils/useFetchRentalTransactionsByUserId";
import RentalFilters from "../../components/myrentals/RentalFilters";
import RentalItem from "../../components/myrentals/RentalItem";
import { useAuth } from "../../context/AuthContext";

const MyRentals = ({ selectedOption }) => {
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
    {
      name: selectedOption === "Owner" ? "To Hand Over" : "To Receive",
      statuses: ["Accepted"],
    },
    {
      name: selectedOption === "Renter" ? "To Return" : "To Receive",
      statuses: ["HandedOver"],
    },
    { name: "Completed", statuses: ["Returned"] },
    { name: "To Review", statuses: ["Completed"] },
    { name: "Cancelled", statuses: ["Cancelled", "Declined"] },
  ];

  // Filter the rental transactions based on the selectedOption (owner/renter)
  const filteredItems = rentalItems.filter((item) => {
    if (selectedOption === "Owner" && item.owner_id !== userId) return false;
    if (selectedOption === "Renter" && item.renter_id !== userId) return false;

    if (activeFilter === "All") return true; // Show all items for "All" filter
    const filterOption = filterOptions.find(
      (option) => option.name === activeFilter
    );
    return filterOption && filterOption.statuses.includes(item.status);
  });

  const countByStatus = () => {
    const counts = filterOptions.reduce((acc, option) => {
      // Filter rental items first by selectedOption (Owner/Renter)
      const filtered = rentalItems.filter((item) => {
        // Filter based on selectedOption (Owner or Renter)
        if (selectedOption === "Owner" && item.owner_id !== userId)
          return false;
        if (selectedOption === "Renter" && item.renter_id !== userId)
          return false;

        // Then filter based on the status for the current filter option
        if (option.statuses.length && !option.statuses.includes(item.status))
          return false;

        return true;
      });

      // Calculate the count of the filtered items
      let count = filtered.length;

      // Subtract "Reviewed" items only if the option name is "Review"
      if (option.name === "To Review") {
        // Filter out items where either the owner or renter is confirmed
        const reviewedCount = filtered.filter(
          (item) => (userId === item.owner_id && item.owner_confirmed) || 
                    (userId === item.renter_id && item.renter_confirmed)
        ).length;
        count -= reviewedCount;
      }
      
      // Assign colors based on confirmation status
      let statusColor;

      if (option.name === "To Review" && count === 0) {
        statusColor = "gray"; // If "To Review" and count is 0, set color to gray
      } else if (option.name === "Request" && count > 0) {
        statusColor = "orange";
      } else if (option.name === "All" || option.name === "Cancelled") {
        statusColor = "white";
      } else {
        statusColor = filtered.reduce((color, item) => {
          // Logic for coloring the item: green for confirmed, orange for pending
          if (
            (selectedOption === "Owner" && item.owner_confirmed) ||
            (selectedOption === "Renter" && item.renter_confirmed) || (option.name === "To Review")
          ) {
            return "orange"; // Confirmed color
          } else {
            return "red"; // Pending color
          }
        }, "gray"); // Default color if no confirmation state is found
      }

      // Update the accumulator to include both count and color
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
