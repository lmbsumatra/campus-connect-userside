import React from "react";
import { useNavigate } from "react-router-dom";

function RentalFilters({
  filterOptions,
  activeFilter,
  onFilterClick,
  selectedOption,
}) {
  const navigate = useNavigate();

  const handleViewProgressClick = () => {
    navigate("/rent-progress");
  };

  // Get dynamic filter text color based on the selected option
  const getDynamicFilterTextColor = () => {
    switch (selectedOption) {
      case "Renter":
        return "var(--clr-renter-txt)"; // Set your custom color variable for Renter
      case "Owner":
        return "var(--clr-owner-txt)";  // Set your custom color variable for Owner
      case "Seller":
        return "var(--clr-seller-txt)";  // Set your custom color variable for Seller
      case "Buyer":
        return "var(--clr-buyer-txt)";   // Set your custom color variable for Buyer
      default:
        return "var(--clr-default-txt)"; // Default color
    }
  };

  

  return (
    <div className="rental-filters overflow-x-auto no-scrollbars">
      <div className="filter-buttons">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            className={`filter-button ${
              activeFilter === filter ? "active" : ""
            }`}
            onClick={() => onFilterClick(filter)}
            style={{
              // Dynamically set the color based on the selected option
              color: getDynamicFilterTextColor(),
              // Use CSS variable for dynamic underline color
              "--underline-color": activeFilter === filter ? getDynamicFilterTextColor() : "#ccc",
            }}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RentalFilters;
