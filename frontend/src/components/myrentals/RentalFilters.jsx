import React from "react";

function RentalFilters({
  filterOptions,
  activeFilter,
  onFilterClick,
  selectedOption,
  countTransactions,
  onTabChange,
}) {
  const getDynamicFilterTextColor = () => {
    const colorMap = {
      renter: "var(--clr-renter-txt)",
      owner: "var(--clr-owner-txt)",
      seller: "var(--clr-seller-txt)",
      buyer: "var(--clr-buyer-txt)",
    };

    return colorMap[selectedOption] || "var(--clr-default-txt)";
  };

  return (
    <div className="rental-filters">
      <div className="filter-buttons">
        {filterOptions.map((filter) => {
          const { count, color } = countTransactions[filter] || {
            count: 0,
            color: "gray",
          };

          const isActive =
            (activeFilter?.toLowerCase() || "") ===
            (filter?.toLowerCase() || "");

          const buttonStyle = {
            color: getDynamicFilterTextColor(),
            "--underline-color": isActive
              ? getDynamicFilterTextColor()
              : "#ccc",
          };

          return (
            <button
              key={filter}
              className={`filter-button ${isActive ? "active" : ""}`}
              onClick={() => {
                onFilterClick(filter);
                onTabChange(filter);
              }}
              style={buttonStyle}
              aria-selected={isActive}
              aria-label={`Filter by ${filter}`}
            >
              {filter}
              {count > 0 && (
                <span
                  className="transaction-indicator"
                  style={{ backgroundColor: color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RentalFilters;
