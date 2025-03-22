import React, { useEffect, useState } from "react";
import deleteIcon from "../../assets/images/toolbar/delete.svg";
import listIcon from "../../assets/images/toolbar/list.svg";
import cardIcon from "../../assets/images/toolbar/card.svg";
import filterIcon from "../../assets/images/toolbar/filter.svg";
import "./toolbarStyles.css";
import { Tooltip } from "@mui/material";
import { defaultFilters } from "../../utils/consonants";
import FilterFunction from "../item-filter/FilterFunction";
import FilterModal from "../../pages/private/users/student-profile/FilterModal";

function Toolbar({
  selectedItems = [],
  onSelectAll,
  onViewToggle,
  viewType,
  onAction,
  items = [],
  onSearch,
  filterOptions,
  isYou,
  isPostPage = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const isAllSelected = selectedItems.length === items.length;
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvancefilter, setShowAdvanceFilter] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(items);
  }, [items, setFilteredItems]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
    const updatedItems = items.filter((item) =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    filterOptions(updatedItems);
  };

  const handleFilterChange = async (filters) => {
    // console.log({ items, filters });
    const updatedItems = await FilterFunction(items, filters, true);
    // console.log(FilterFunction(items, filters, false));
    setFilteredItems(updatedItems);
    filterOptions(updatedItems);
  };

  return (
    <div className="toolbar">
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

      <div className="search-container light">
        <input
          type="text"
          className="light"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div>
        <Tooltip title="Click to use advance filter">
          <button
            className="btn btn-icon tertiary"
            onClick={() => setShowAdvanceFilter(true)}
          >
            <img src={filterIcon} alt="Filter icon" />
          </button>
        </Tooltip>
      </div>

      {showAdvancefilter && (
        <FilterModal
          showFilterModal={showAdvancefilter}
          close={() => setShowAdvanceFilter(false)}
          applyFilters={handleFilterChange}
          filters={filters}
          setFilters={setFilters}
          isYou={isYou}
          isListingsPage={true}
          isPostPage={isPostPage}
          setFilteredItems={setFilteredItems}
        />
      )}

      <div className="view-type">
        <Tooltip
          title={`Click to view in ${viewType === "card" ? "list" : "card"}`}
        >
          <button className="btn btn-icon tertiary" onClick={onViewToggle}>
            {viewType === "card" ? (
              <img src={listIcon} alt="List view" />
            ) : (
              <img src={cardIcon} alt="Card view" />
            )}
          </button>
        </Tooltip>
      </div>

      <div>
        <Tooltip
          title={
            selectedItems.length === 0
              ? "Select an item to delete"
              : "Click to delete selected item"
          }
        >
          <button
            className="btn btn-icon tertiary"
            disabled={selectedItems.length === 0}
            onClick={onAction}
          >
            <img src={deleteIcon} alt="Delete" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default Toolbar;
