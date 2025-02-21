import React from "react";
import { defaultFilters } from "../../utils/consonants";

const ResetFilters = ({ setFilteredItems, setFilters, allApprovedPosts }) => {
  const resetFilters = () => {
    setFilters(defaultFilters);

    setFilteredItems(allApprovedPosts); // 🔥 Reset items
  };

  return (
    <button className="btn btn-secondary" onClick={resetFilters}>
      Reset Filters
    </button>
  );
};

export default ResetFilters;
