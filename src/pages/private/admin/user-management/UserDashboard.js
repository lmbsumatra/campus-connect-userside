import React, { useState } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./postDashboard.css";
import SortFilterComponent from "../../../../components/SortAndFilter/SortFilterComponent"; // Import the SortFilterComponent
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";
import useFetchAllUsersData from "../../../../utils/FetchAllUsersData";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

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

  // Prepare data for TableComponent
  const data = users.map((user) => {
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

  // Function to filter and sort the users
  const getFilteredAndSortedData = () => {
    let filteredData = users;

    if (statusFilter) {
      filteredData = filteredData.filter(
        (user) => user.status === statusFilter
      );
    }

    if (categoryFilter) {
      filteredData = filteredData.filter(
        (user) => user.category === categoryFilter
      );
    }

    if (sortOption) {
      filteredData = [...filteredData].sort((a, b) => {
        switch (sortOption) {
          case "title":
            return a.post_item_name.localeCompare(b.post_item_name);
          case "renter":
            return `${a.renter.first_name} ${a.renter.last_name}`.localeCompare(
              `${b.renter.first_name} ${b.renter.last_name}`
            );
          case "date":
            return new Date(a.created_at) - new Date(b.created_at);
          default:
            return 0;
        }
      });
    }

    return filteredData;
  };
  return (
    <div className="admin-content-container">
      <div className="row">
        {/* Left Side: Recent Posts */}
        <div className="col-lg-8">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Users</h4>

            {/* Sorting and Filtering Component */}
            <SortFilterComponent
              sortOption={sortOption}
              onSortChange={setSortOption}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
            <TableComponent
              headers={headers}
              data={data}
              // statusColumnIndex={5}
            />
          </div>
        </div>

        {/* Right Side: Widgets */}
        <div className="col-lg-4">
          {/* New Posts Widget */}
          <div className="mb-3 p-3 bg-white rounded shadow-sm">
            <h5>New Posts</h5>
            <div className="new-posts d-flex">
              <div className="profile-pic-placeholder me-2"></div>
              <div className="profile-pic-placeholder me-2"></div>
              <div className="profile-pic-placeholder me-2"></div>
              <button className="btn btn-light btn-sm">+</button>
            </div>
          </div>

          {/* Listing Growth Widget */}
          <div className="mb-3 p-3 bg-white rounded shadow-sm">
            <h5>Listing Growth</h5>
            <div className="d-flex align-items-center">
              <h2>100+</h2>
              <span className="ms-2 text-success">+2.45%</span>
            </div>
            <small className="text-muted">Monthly Growth</small>
          </div>

          {/* Top Posts Widget */}
          <div className="p-3 bg-white rounded shadow-sm">
            <h5>Top Posts</h5>
            <div className="top-posts">
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