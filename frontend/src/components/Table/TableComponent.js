import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TableComponent.css";
import { categories, COLLEGES } from "../../utils/consonants";

const TableComponent = ({
  headers,
  data,
  statusColumnIndex,
  columnsConfig = [],
  onSortChange,
  onFilterChange,
  currentFilters = {},
  currentSort = {},
  statusOptions = [], 
}) => {
  // Helper to determine current filter value for a header
  const getCurrentFilterValue = (header) => {
    return currentFilters[header.toLowerCase()] || "";
  };

  // Helper to determine current sort order for a header
  const getCurrentSortOrder = (header) => {
    return currentSort.column === header ? currentSort.order : "default";
  };

  const renderHeaderControls = (header, index) => {
    // First try to use columnsConfig if available
    const config = columnsConfig.find((c) => c.header === header) || {};

    // If config exists, use the new approach
    if (columnsConfig.length > 0) {
      return (
        <>
          {/* Sort Control */}
          {config.sortable && (
            <select
              className="form-select form-select-sm control-select sort-select"
              value={getCurrentSortOrder(header)}
              onChange={(e) => onSortChange(header, e.target.value)}
              aria-label={`Sort by ${header}`}
            >
              <option value="default">Sort</option>
              <option value="ascending">Ascending ↑</option>
              <option value="descending">Descending ↓</option>
            </select>
          )}

          {/* Filter Control */}
          {config.filterable && (
            <select
              className="form-select form-select-sm control-select filter-select"
              value={getCurrentFilterValue(header)}
              onChange={(e) => onFilterChange(header, e.target.value)}
              aria-label={`Filter by ${header}`}
            >
              <option value="all">
                {config.filterLabels?.["all"] || "All"}
              </option>
              {Array.isArray(config.filterOptions) &&
                config.filterOptions
                  .filter((optValue) => optValue !== "all")
                  .map((optionValue) => (
                    <option key={optionValue} value={optionValue}>
                      {(config.filterLabels &&
                        config.filterLabels[optionValue]) ||
                        optionValue}
                    </option>
                  ))}
            </select>
          )}
        </>
      );
    }

    // Fall back to original hardcoded controls if no columnsConfig
    switch (header) {
      case "User":
      case "Title":
      case "Renter":
      case "Owner":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onSortChange(header, e.target.value)}
          >
            <option value="default">Default</option>
            <option value="asc">Ascending ↑</option>
            <option value="desc">Descending ↓</option>
          </select>
        );
      case "College":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onFilterChange(header, e.target.value)}
          >
            <option value="">All</option>
            {COLLEGES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        );
      case "Category":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onFilterChange(header, e.target.value)}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        );
      case "Type":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onFilterChange(header, e.target.value)}
          >
            <option value="all">All</option>
            <option value="rental">Rental</option>
            <option value="sell">Sell</option>
          </select>
        );

      case "Entity Type":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onFilterChange(header, e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="user">User</option>
            <option value="listing">Listing</option>
            <option value="post">Post</option>
            <option value="sale">Sale</option>
          </select>
        );
      case "Date Added":
      case "Date Updated":
      case "Date":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onSortChange(header, e.target.value)}
          >
            <option value="default">Default</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        );
      case "Status":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onFilterChange(header, e.target.value)}
          >
            <option value="">All</option>
            {statusOptions.map((status, idx) => (
              <option key={idx} value={status}>
                {status}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="table-responsive custom-table-container">
      <table className="table table-hover custom-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="header-cell">
                <div className="header-content">
                  <span className="header-text">{header}</span>
                  <div className="header-control">
                    {renderHeaderControls(header, index)}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="data-row">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="data-cell">
                  {cellIndex === statusColumnIndex ? (
                    <span
                      className={`status-badge ${getStatusBadgeClass(cell)}`}
                    >
                      {cell}
                    </span>
                  ) : (
                    <div className="cell-content">{cell}</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// status badge helper
const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "status-approved";
    case "declined":
    case "rejected":
      return "status-declined";
    case "suspended":
      return "status-suspended";
    case "pending":
      return "status-pending";
    default:
      return "status-default";
  }
};

export default TableComponent;
