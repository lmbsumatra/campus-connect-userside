import React, { useState } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./listingDashboard.css";
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";
import SortFilterComponent from "../../../../components/SortAndFilter/SortFilterComponent";
import useFetchAllListingsData from "../../../../utils/FetchAllListingsData";
import { useNavigate } from "react-router-dom";

const ListingOverview = () => {
  const [sortOption, setSortOption] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const headers = [
    "Thumbnail",
    "Title",
    "Category",
    "Renter",
    "Date Added",
    "Status",
    "Action",
  ];

  const { listings, error, loading } = useFetchAllListingsData();
  const navigate = useNavigate();

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleView = (listingId) => {
    navigate(`/admin/listings/listing-approval/${listingId}`)
  };

  const handleEdit = (listingId) => {
    console.log(`Editing post with ID: ${listingId}`);
  };

  const handleDelete = (listingId) => {
    console.log(`Deleting post with ID: ${listingId}`);
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
  const data = listings.map((listing) => {
    const { label, className } = getStatusInfo(listing.status);
    return [
      <div className="thumbnail-placeholder"></div>,
      listing.listing_name,
      listing.category,
      <>
        {listing.owner.first_name} {listing.owner.last_name}
      </>,
      formatDate(listing.created_at),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
      <button
          className="btn btn-action view"
          onClick={() => handleView(listing.id)}
        >
          View
        </button>
        <button
          className="btn btn-action edit"
          onClick={() => handleEdit(listing.id)}
        >
          Edit
        </button>
        <button
          className="btn btn-action delete"
          onClick={() => handleDelete(listing.id)}
        >
          Delete
        </button>
      </div>,
    ];
  });


  // Function to filter and sort the posts
  const getFilteredAndSortedData = () => {
    let filteredData = listings;

    if (statusFilter) {
      filteredData = filteredData.filter(listing => listing.status === statusFilter);
    }

    if (categoryFilter) {
      filteredData = filteredData.filter(listing => listing.category === categoryFilter);
    }

    if (sortOption) {
      filteredData = [...filteredData].sort((a, b) => {
        switch (sortOption) {
          case 'title':
            return a.post_item_name.localeCompare(b.post_item_name);
          case 'renter':
            return `${a.renter.first_name} ${a.renter.last_name}`.localeCompare(
              `${b.renter.first_name} ${b.renter.last_name}`
            );
          case 'date':
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
        <div className="col-lg-12">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Listings</h4>

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
      </div>
    </div>
  );
};

export default ListingOverview;