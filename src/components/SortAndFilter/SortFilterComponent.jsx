// SortFilterComponent.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SortFilterComponent = ({
  sortOption,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}) => {
  return (
    <div className="d-flex justify-content-end align-items-center mb-3">
      <div>
        <label htmlFor="sortSelect" className="me-2">Sort by:</label>
        <select
          id="sortSelect"
          className="form-select d-inline-block w-auto"
          onChange={(e) => onSortChange(e.target.value)}
          value={sortOption}
        >
          <option value="">Select</option>
          <option value="title">Title</option>
          <option value="renter">Renter</option>
          <option value="date">Date</option>
        </select>
      </div>
      <div>
        <label htmlFor="statusFilter" className="me-2">Filter by Status:</label>
        <select
          id="statusFilter"
          className="form-select d-inline-block w-auto"
          onChange={(e) => onStatusFilterChange(e.target.value)}
          value={statusFilter}
        >
          <option value="">All</option>
          <option value="Posted">Posted</option>
          <option value="Pending">Pending</option>
          <option value="Removed">Removed</option>
          <option value="Flagged">Flagged</option>
          <option value="Offered">Offered</option>
        </select>
      </div>
      <div>
        <label htmlFor="categoryFilter" className="me-2">Filter by Category:</label>
        <select
          id="categoryFilter"
          className="form-select d-inline-block w-auto"
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          value={categoryFilter}
        >
          <option value="">All</option>
          <option value="CAFA">CAFA</option>
          <option value="CIE">CIE</option>
          <option value="CIT">CIT</option>
          <option value="CLA">CLA</option>
          <option value="COE">COE</option>
          <option value="COS">COS</option>
        </select>
      </div>
    </div>
  );
};

export default SortFilterComponent;
