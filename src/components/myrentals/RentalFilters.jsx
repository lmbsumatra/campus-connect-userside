import React from "react";
import { useNavigate } from "react-router-dom";

function RentalFilters({
  filterOptions,
  activeFilter,
  onFilterClick,
  selectedOption,
  countTransactions,
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
        {filterOptions.map((filter) => (
          <button
            key={filter}
            className={`filter-button ${activeFilter === filter ? "active" : ""}`}
            onClick={() => onFilterClick(filter)}
            style={{
              color: getDynamicFilterTextColor(),
              "--underline-color": activeFilter === filter ? getDynamicFilterTextColor() : "#ccc",
            }}
          >
            {filter} <span className={`transaction-indicator ${!countTransactions[filter] && 'not-active'}`}>{countTransactions[filter] !== undefined && countTransactions[filter]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RentalFilters;
