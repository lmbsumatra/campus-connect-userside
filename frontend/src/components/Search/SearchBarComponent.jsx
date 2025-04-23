import React from "react";

const SearchBarComponent = ({ searchQuery, onSearchChange }) => {
  const containerStyle = {
    position: "relative",
    marginBottom: "20px",
    width: "100%",
  };

  const searchBarStyle = {
    width: "100%",
    padding: "10px 40px 10px 15px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #000",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    transition: "border 0.2s ease",
    outline: "none",
    // backgroundColor: "#f9f9f9",
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
        placeholder="Search..."
        className="search-input"
      />
      <svg 
        style={iconStyle} 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );
};

export default SearchBarComponent;