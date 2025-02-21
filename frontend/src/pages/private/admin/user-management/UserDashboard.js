import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TableComponent from "../../../../components/Table/TableComponent";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import useFetchAllUsersData from "../../../../utils/FetchAllUsersData";
import { formatDate } from "../../../../utils/dateFormat";
import "./postDashboard.css";
import {
  UserAnalytics,
  ActiveUsersByCollege,
  VerificationRate,
} from "../../../../components/Analytics/UserAnalyticsComponents";

const UserDashboard = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const navigate = useNavigate();

  const headers = [
    "Thumbnail",
    "College",
    "User",
    "Date Added",
    "Status",
    "Action",
  ];

  const { users, error, loading } = useFetchAllUsersData();

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

  const getFilteredData = () => {
    let filteredData = originalData;

    const normalizedSearchQuery = searchQuery
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    if (normalizedSearchQuery) {
      filteredData = filteredData.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const college = user.student?.college.toLowerCase() || "";
        const normalizedDateAdded = formatDate(user.createdAt).toLowerCase();

        return (
          fullName.includes(normalizedSearchQuery) ||
          college.includes(normalizedSearchQuery) ||
          normalizedDateAdded.includes(normalizedSearchQuery)
        );
      });
    }

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

        // Default sorting by Date Added (newest first) if no sorting option is selected
        if (!sortOptions["Date Added"]) {
          sorted = sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

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
        <div className="col-lg-8">
          <SearchBarComponent
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <TableComponent
            headers={headers}
            data={data}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
          />
          {loading && <p>Loading ...</p>}
          {error && <p>Error: {error}</p>}
          
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        <div className="col-lg-4">
          <UserAnalytics users={users} />
          <ActiveUsersByCollege users={users} />
          <VerificationRate users={users} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
