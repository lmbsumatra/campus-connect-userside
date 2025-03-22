import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TableComponent.css";

const TableComponent = ({
  headers,
  data,
  statusColumnIndex,
  onSortChange,
  onFilterChange,
  statusOptions = [],
}) => {
  const renderHeaderControls = (header, index) => {
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
      case "Category":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onFilterChange(header, e.target.value)}
          >
            <option value="">All</option>
            <option value="CAFA">CAFA</option>
            <option value="CIE">CIE</option>
            <option value="CIT">CIT</option>
            <option value="CLA">CLA</option>
            <option value="COE">COE</option>
            <option value="COS">COS</option>
          </select>
        );
      case "Type":
        return (
          <select
            className="form-select form-select-sm control-select"
            onChange={(e) => onFilterChange(header, e.target.value)}
          >
            <option value="">All</option>
            <option value="rental">RENTAL</option>
            <option value="sell">SALE</option>
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

// Helper function to determine badge color based on status
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
