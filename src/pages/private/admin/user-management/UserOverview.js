import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import useFetchAllUsersData from "../../../../utils/FetchAllUsersData";
import { formatDate } from "../../../../utils/dateFormat";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";

const UserOverview = () => {
  const [searchQuery, setSearchQuery] = useState("");
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

  // getStatusInfo for managing the user status
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

  const handleView = (userId) => {
    navigate(`/admin/users/user-verification/${userId}`);
  };

  const handleEdit = (userId) => {
    console.log(`Editing user with ID: ${userId}`);
  };

  const handleDelete = (userId) => {
    console.log(`Delete user with ID: ${userId}`);
  };

  const handleSortChange = (column, order) => {
    if (order === "default") {
      setSortOptions({});
    } else {
      setSortOptions((prevSortOptions) => {
        const newSortOptions = { [column]: order };
        return newSortOptions;
      });
    }
  };

  const handleFilterChange = (column, value) => {
    setFilterOptions((prevFilters) => {
      return { ...prevFilters, [column]: value };
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // UseEffect to set original data when users data changes
  useEffect(() => {
    if (users.length) {
      setOriginalData(users);
    }
  }, [users]);

  // Filter the users based on search query and filters
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

        return (
          fullName.includes(normalizedSearchQuery) ||
          college.includes(normalizedSearchQuery)
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

  // Apply sorting to the filtered data
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

  // Get sorted data
  const sortedFilteredData = sortedData();

  // Pagination logic
  const totalUsers = sortedFilteredData.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Map users data to table rows
  const data = displayedData.map((user) => [
    <div className="thumbnail-placeholder"></div>,
    <>{user.student?.college || ""}</>,
    <>
      {user.first_name} {user.last_name}
    </>,
    formatDate(user.createdAt),
    <span className={`badge ${getStatusInfo(user.status).className}`}>
      {getStatusInfo(user.status).label}
    </span>,
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
  ]);

  return (
    <div className="admin-content-container">
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
      {/* Show loading or error message */}
      {loading && <p>Loading ...</p>}
      {error && <p>Error: {error}</p>}

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UserOverview;
