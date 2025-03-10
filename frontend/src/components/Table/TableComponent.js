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
            className="form-select"
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
            className="form-select"
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
              className="form-select"
              onChange={(e) => onFilterChange(header, e.target.value)}
            >
              <option value="">All</option>
              <option value="rental">RENTAL</option>
              <option value="buy_and_sell">SALE</option>
            </select>
          );
      case "Date Added":
      case "Date Updated":
      case "Date":
        return (
          <select
            className="form-select"
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
              className="form-select"
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
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>
                {header}
                {renderHeaderControls(header, index)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {cellIndex === statusColumnIndex ? (
                    <span className={`badge ${getStatusBadgeClass(cell)}`}>
                      {cell}
                    </span>
                  ) : (
                    cell
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
  switch (status) {
    case "Approved":
      return "bg-success";
    case "Declined":
      return "bg-danger";
    case "Suspended":
      return "bg-secondary";
    default:
      return "bg-light";
  }
};

export default TableComponent;
