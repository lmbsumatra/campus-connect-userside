// src/components/SearchBar/SearchBarComponent.jsx
import React from "react";

const SearchBarComponent = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="search-bar mb-3">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="form-control"
        placeholder="Search "
      />
    </div>
  );
};

export default SearchBarComponent;
