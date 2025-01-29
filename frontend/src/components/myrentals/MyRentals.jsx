import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import useFetchRentalTransactionsByUserId from "../../utils/useFetchRentalTransactionsByUserId";
import RentalFilters from "./RentalFilters";
import RentalItem from "./RentalItem";
import { useAuth } from "../../context/AuthContext";

  // Format filter names for route (lowercase and hyphenated)
  const formatForRoute = (name) => {
    return name.toLowerCase();
  };


const MyRentals = ({ selectedOption, selectedTab, onTabChange }) => {
  const { studentUser } = useAuth();
  const userId = studentUser.userId;
  const [activeFilter, setActiveFilter] = useState(selectedTab || "requests");
  const navigate = useNavigate();

  const { transactions: rentalItems, error, loading } = useFetchRentalTransactionsByUserId(userId);

  useEffect(() => {
    // Ensure selectedTab is in the same format (lowercase with hyphens) as activeFilter
    const formattedTab = formatForRoute(selectedTab);
    setActiveFilter(formattedTab);
  }, [selectedTab]);

  const handleFilterClick = (filter) => {
    const formattedFilter = formatForRoute(filter);
    setActiveFilter(formattedFilter);
    onTabChange(filter); 
  };

  const openRentProgress = (rentalId) => {
    const formattedRentalId = rentalId.replace(/\s+/g, "-");
    navigate(`/rent-progress/${formattedRentalId}`);
  };

  if (loading) return <p>Loading...</p>;

  const filterOptions = [
    { name: "Requests", statuses: ["Requested"] },
    { name: selectedOption === "owner" ? "To Hand Over" : "To Receive", statuses: ["Accepted"] },
    { name: selectedOption === "renter" ? "To Return" : "To Receive", statuses: ["HandedOver"] },
    { name: "Completed", statuses: ["Returned"] },
    { name: "To Review", statuses: ["Completed"] },
    { name: "Cancelled", statuses: ["Cancelled", "Declined"] },
  ];

  const formattedFilterOptions = filterOptions.map((option) => ({
    ...option,
    nameForLabel: option.name,
    nameForRoute: formatForRoute(option.name),
  }));

  const filteredItems = rentalItems.filter((item) => {
    if (selectedOption === "owner" && item.owner_id !== userId) return false;
    if (selectedOption === "renter" && item.renter_id !== userId) return false;

    if (activeFilter === "all") return true;
    const filterOption = formattedFilterOptions.find(
      (option) => option.nameForRoute === activeFilter
    );
    return filterOption && filterOption.statuses.includes(item.status);
  });

  const countByStatus = () => {
    const counts = formattedFilterOptions.reduce((acc, option) => {
      const filtered = rentalItems.filter((item) => {
        if (selectedOption === "owner" && item.owner_id !== userId) return false;
        if (selectedOption === "renter" && item.renter_id !== userId) return false;
        if (option.statuses.length && !option.statuses.includes(item.status)) return false;
        return true;
      });

      let count = filtered.length;

      if (option.name === "To Review") {
        const reviewedCount = filtered.filter(
          (item) =>
            (userId === item.owner_id && item.owner_confirmed) ||
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
            (selectedOption === "owner" && item.owner_confirmed) ||
            (selectedOption === "renter" && item.renter_confirmed) ||
            option.name === "To Review"
          ) {
            return "orange";
          } else {
            return "red";
          }
        }, "gray");
      }

      acc[option.nameForLabel] = { count, color: statusColor };
      return acc;
    }, {});

    return counts;
  };

  return (
    <div className="container rounded bg-white">
      {activeFilter}
      <div className="w-100">
        <RentalFilters
          filterOptions={formattedFilterOptions.map(
            (option) => option.nameForLabel
          )}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
          selectedOption={selectedOption}
          countTransactions={countByStatus()}
          selectedTab={selectedTab}
          onTabChange={onTabChange}
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
