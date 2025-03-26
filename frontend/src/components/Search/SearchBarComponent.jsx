import React from "react";

const SearchBarComponent = ({ searchQuery, onSearchChange }) => {
  const searchBarStyle = {
    width: "100%",
    padding: "10px 15px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#e0e0e0",
  };

  const containerStyle = {
    position: "relative",
    marginBottom: "20px",
  };

  const iconStyle = {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    pointerEvents: "none",
  };

  return (
    <div style={containerStyle}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={searchBarStyle}
        placeholder="Search ..."
        className="search-input"
      />
      <span style={iconStyle}>🔍</span>
    </div>
  );
};

export default SearchBarComponent;
