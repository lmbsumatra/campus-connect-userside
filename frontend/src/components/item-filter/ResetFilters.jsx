import React from "react";

const ResetFilters = ({ setFilteredItems, setFilters, allApprovedPosts }) => {
  const resetFilters = () => {
    setFilteredItems(allApprovedPosts);
    setFilters({
      category: "",
      condition: [],
      priceRange: [0, 1000],
      sortBy: "",
    });
  };

  return (
    <button className="btn btn-secondary" onClick={resetFilters}>
      Reset Filters
    </button>
  );
};

export default ResetFilters;
