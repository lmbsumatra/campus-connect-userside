// src/components/MyRentals/RentalFilters.js
import React from "react";
import { useNavigate } from "react-router-dom";

function RentalFilters({ filterOptions, activeFilter, onFilterClick }) {
  const navigate = useNavigate();

  const handleViewProgressClick = () => {
    navigate("/rent-progress");
  };

  return (
    <div className="rental-filters">
      <div className="filter-buttons">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            className={`filter-button ${activeFilter === filter ? "active" : ""}`}
            onClick={() => onFilterClick(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      {/* <button
        className="filter-button view-progress-button"
        onClick={handleViewProgressClick}
      >
        View Transaction Details &gt;&gt;
      </button> */}
    </div>
  );
}

export default RentalFilters;

