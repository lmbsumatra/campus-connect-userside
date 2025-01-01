import React, { useState } from "react";
import deleteIcon from "../../assets/images/table/delete.svg";
import listIcon from "../../assets/images/toolbar/list.svg";
import cardIcon from "../../assets/images/toolbar/card.svg";
import filterIcon from "../../assets/images/toolbar/filter.svg";
import "./toolbarStyles.css";
import FilterModal from "../../pages/private/users/student-profile/FilterModal";

function Toolbar({
  selectedItems,
  onSelectAll,
  onViewToggle,
  viewType,
  onAction,
  items,
  onSearch,
  onFilter,
  filterOptions,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const isAllSelected = selectedItems.length === items.length;
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleShowFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // Pass search term to parent component
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    onFilter(e.target.value); // Pass filter value to parent component
  };

  return (
    <div className="toolbar items">
      {/* Select/Deselect All Checkbox */}
      <div className="select-container">
        <label className="select">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
          />
          {isAllSelected ? "Deselect All" : "Select All"}
        </label>
      </div>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div>
        <button
          className="btn btn-icon primary"
          onClick={() => handleShowFilterModal()}
        >
          <img src={filterIcon} alt="Filter icon" />
        </button>
      </div>
      {/* Filter Modal */}
      <FilterModal
        show={showFilterModal}
        handleClose={() => setShowFilterModal(false)} // Close modal
        items={items}
      />

      {/* Toggle View Button */}
      <div className="view-type">
        <button className="btn btn-icon primary" onClick={onViewToggle}>
          {viewType === "card" ? (
            <img src={listIcon} alt="List view" />
          ) : (
            <img src={cardIcon} alt="Card view" />
          )}
        </button>
      </div>

      {/* Action Button (Delete) */}
      <div className="">
        <button
          className="btn btn-icon primary"
          disabled={selectedItems.length === 0}
          onClick={onAction}
        >
          <img src={deleteIcon} alt="Delete" />
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
