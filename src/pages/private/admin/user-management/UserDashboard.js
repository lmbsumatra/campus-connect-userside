import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./postDashboard.css";
import useFetchAllUsersData from "../../../../utils/FetchAllUsersData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent"; // Import the SearchBarComponent
import PaginationComponent from "../../../../components/Pagination/PaginationComponent"; // Pagination Component

const UserDashboard = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);

  const headers = [
    "Thumbnail",
    "College",
    "User",
    "Date Added",
    "Status",
    "Action",
  ];

  const { users, error, loading } = useFetchAllUsersData();
  const navigate = useNavigate();

  useEffect(() => {
    if (users.length) {
      setOriginalData(users);
    }
  }, [users]);

  const handleView = (userId) => {
    navigate(`/admin/users/user-verification/${userId}`);
  };

  const handleEdit = (userId) => {
    console.log(`Editing user with ID: ${userId}`);
  };

  const handleDelete = (userId) => {
    console.log(`Deleting user with ID: ${userId}`);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "posted":
        return { label: "Posted", className: "bg-success text-white" };
      case "flagged":
        return { label: "Flagged", className: "bg-warning text-dark" };
      case "offered":
        return { label: "Offered", className: "bg-info text-white" };
      case "pending":
        return { label: "Pending", className: "bg-secondary text-white" };
      case "removed":
        return { label: "Removed", className: "bg-danger text-white" };
      default:
        return { label: "Unknown", className: "bg-light text-dark" };
    }
  };

  const handleSortChange = (column, order) => {
    if (order === "default") {
      setSortOptions({});
    } else {
      setSortOptions({ [column]: order });
    }
  };

  const handleFilterChange = (column, value) => {
    setFilterOptions((prev) => ({ ...prev, [column]: value }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to filter users based on search query
  const getFilteredData = () => {
    let filteredData = originalData;

    // Normalize the search query by trimming and reducing multiple spaces to a single space
    const normalizedSearchQuery = searchQuery
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .toLowerCase(); // Make the search query lowercase

    // Apply search query
    if (normalizedSearchQuery) {
      filteredData = filteredData.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const college = user.student?.college.toLowerCase() || "";
        const normalizedDateAdded = formatDate(user.createdAt).toLowerCase(); // Normalize the Date Added to lowercase

        return (
          fullName.includes(normalizedSearchQuery) || // Search for Name
          college.includes(normalizedSearchQuery) || // Search for College
          normalizedDateAdded.includes(normalizedSearchQuery) // Search for Date Added
        );
      });
    }

    // Apply filters for College and Status (if set)
    if (filterOptions["College"]) {
      filteredData = filteredData.filter(
        (user) => user.student?.college === filterOptions["College"]
      );
    }

    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (user) => user.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

    if (Object.keys(sortOptions).length > 0) {
      if (sortOptions["User"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["User"] === "asc"
            ? a.first_name.localeCompare(b.first_name)
            : b.first_name.localeCompare(a.first_name)
        );
      }

      if (sortOptions["Date Added"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Date Added"] === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    }

    return sorted;
  };

  const sortedFilteredData = sortedData();

  // Pagination logic
  const totalItems = sortedFilteredData.length;
  const totalPages = Math.ceil(totalItems / usersPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const data = displayedData.map((user) => {
    const { label, className } = getStatusInfo(user.status);
    return [
      <div className="thumbnail-placeholder"></div>,
      <>{user.student?.college || ""}</>,
      <>
        {user.first_name} {user.last_name}
      </>,
      formatDate(user.createdAt),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(user.user_id)}
        >
          View
        </button>
        <button
          className="btn btn-action edit"
          onClick={() => handleEdit(user.user_id)}
        >
          Edit
        </button>
        <button
          className="btn btn-action delete"
          onClick={() => handleDelete(user.user_id)}
        >
          Delete
        </button>
      </div>,
    ];
  });

  return (
    <div className="admin-content-container">
      <div className="row">
        {/* Left Side: Recent Users */}
        <div className="col-lg-8">
          <div className="recent-users-header p-3 mb-3">
            <h4>Recent Users</h4>

            {/* Search Bar Component */}
            <SearchBarComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Table Component */}
            <TableComponent
              headers={headers}
              data={data}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
            />

            {/* Show loading or error message */}
            {loading && <p>Loading ...</p>}
            {error && <p>Error: {error}</p>}

            {/* Pagination Component */}
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Right Side: Widgets */}
        <div className="col-lg-4">
          {/* New Users Widget */}
          <div className="mb-3 p-3 bg-white rounded shadow-sm">
            <h5>New Users</h5>
            <div className="new-users d-flex">
              <div className="profile-pic-placeholder me-2"></div>
              <div className="profile-pic-placeholder me-2"></div>
              <div className="profile-pic-placeholder me-2"></div>
              <button className="btn btn-light btn-sm">+</button>
            </div>
          </div>

          {/* Growth Widget */}
          <div className="mb-3 p-3 bg-white rounded shadow-sm">
            <h5>Growth</h5>
            <div className="d-flex align-items-center">
              <h2>100+</h2>
              <span className="ms-2 text-success">+2.45%</span>
            </div>
            <small className="text-muted">Monthly Growth</small>
          </div>

          {/* Top Users Widget */}
          <div className="p-3 bg-white rounded shadow-sm">
            <h5>Top Users</h5>
            <div className="top-users">
              <div className="d-flex align-items-center mb-2">
                <div className="profile-pic-placeholder me-2"></div>
                <span>Jane Smith</span>
                <span className="ms-auto text-warning">4.9 ★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
