import React from "react";
import { useNavigate } from "react-router-dom";

function RentalFilters({
  filterOptions,
  activeFilter,
  onFilterClick,
  selectedOption,
  countTransactions,
  onTabChange, // Fix prop name here
}) {
  const navigate = useNavigate();

  // Get dynamic filter text color based on the selected option
  const getDynamicFilterTextColor = () => {
    switch (selectedOption) {
      case "Renter":
        return "var(--clr-renter-txt)";
      case "Owner":
        return "var(--clr-owner-txt)";
      case "Seller":
        return "var(--clr-seller-txt)";
      case "Buyer":
        return "var(--clr-buyer-txt)";
      default:
        return "var(--clr-default-txt)";
    }
  };

  return (
    <div className="rental-filters">
      <div className="filter-buttons no-scrollbars">
        {filterOptions.map((filter) => {
          // Get count and color for the current filter
          const { count, color } = countTransactions[filter] || {
            count: 0,
            color: "gray",
          };

          return (
            <button
              key={filter}
              className={`filter-button ${activeFilter === filter ? "active" : ""}`}
              onClick={() => {
                onFilterClick(filter); // Update filter
                onTabChange(filter); // Change tab when a filter is clicked
              }}
              style={{
                color: getDynamicFilterTextColor(),
                "--underline-color":
                  activeFilter === filter ? getDynamicFilterTextColor() : "#ccc",
              }}
            >
              {filter}
              <span
                className="transaction-indicator"
                style={{ backgroundColor: color }}
              >
                {count} {/* Only show the count if greater than 0 */}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RentalFilters;
