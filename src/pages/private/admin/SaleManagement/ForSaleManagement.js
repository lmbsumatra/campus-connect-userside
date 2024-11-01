import React, { useState } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./forSaleManagement.css";
import SortFilterComponent from "../../../../components/SortAndFilter/SortFilterComponent"; // Import the SortFilterComponent
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";
import useFetchAllItemsForSaleData from "../../../../utils/FetchAllItemsForSaleData";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";

const ForSaleManagement = () => {
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const navigate = useNavigate();

  const headers = [
    "Thumbnail",
    "Title",
    "Category",
    "Renter",
    "Date Added",
    "Status",
    "Action",
  ];

  const { items, error, loading } = useFetchAllItemsForSaleData();
  console.log(items);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;
  
  const handleView = (postId) => {
    navigate(`/admin/sales/item-approval/${postId}`);
  };

  const handleEdit = (postId) => {
    console.log(`Editing post with ID: ${postId}`);
  };

  const handleDelete = (postId) => {
    console.log(`Deleting post with ID: ${postId}`);
  };


  // Prepare data for TableComponent
  const data = items.map((item) => {
    const { label, className } = ItemStatus(item.status);
    return [
      <div className="thumbnail-placeholder"></div>,
      item.item_for_sale_name,
      item.category,
      <>
        {item.seller.first_name} {item.seller.last_name}
      </>,
      formatDate(item.created_at),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(item.id)}
        >
          View
        </button>
        <button
          className="btn btn-action edit"
          onClick={() => handleEdit(item.id)}
        >
          Edit
        </button>
        <button
          className="btn btn-action delete"
          onClick={() => handleDelete(item.id)}
        >
          Delete
        </button>
      </div>,
    ];
  });

  // Function to filter and sort the posts
  const getFilteredAndSortedData = () => {
    let filteredData = items;

    if (statusFilter) {
      filteredData = filteredData.filter(
        (post) => post.status === statusFilter
      );
    }

    if (categoryFilter) {
      filteredData = filteredData.filter(
        (post) => post.category === categoryFilter
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
            <h4>Recent Sale</h4>

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
            <h5>New Sale</h5>
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
            <h5>Top Sale</h5>
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

export default ForSaleManagement;
