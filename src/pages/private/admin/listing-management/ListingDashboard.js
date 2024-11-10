import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./listingDashboard.css";
import useFetchAllListingsData from "../../../../utils/FetchAllListingsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent"; // Import SearchBar
import PaginationComponent from "../../../../components/Pagination/PaginationComponent"; // Import Pagination Component

const ListingDashboard = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [sortOptions, setSortOptions] = useState({}); // Sort options state
  const [filterOptions, setFilterOptions] = useState({}); // Filter options state
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [listingsPerPage] = useState(10); // Listings per page
  const [originalData, setOriginalData] = useState([]); // State for storing original data

  const headers = [
    "Thumbnail",
    "Title",
    "Category",
    "Owner",
    "Date Added",
    "Status",
    "Action",
  ];

  const { listings, error, loading } = useFetchAllListingsData();
  const navigate = useNavigate();

  useEffect(() => {
    if (listings.length) {
      setOriginalData(listings);
    }
  }, [listings]);

  if (loading) return <p>Loading listings...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleView = (itemId) => {
    navigate(`/admin/listings/listing-approval/${itemId}`);
  };

  const handleEdit = (itemId) => {
    console.log(`Editing listing with ID: ${itemId}`);
  };

  const handleDelete = (itemId) => {
    console.log(`Deleting listing with ID: ${itemId}`);
  };

  const getStatusInfo = (status) => {
    const { label, className } = ItemStatus(status);
    return { label, className };
  };

  const handleSortChange = (column, order) => {
    if (order === "default") {
      setSortOptions({});
    } else {
      setSortOptions({ [column]: order });
    }
  };

  const handleFilterChange = (column, value) => {
    setFilterOptions({ ...filterOptions, [column]: value });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to filter listings based on search query
  const getFilteredData = () => {
    let filteredData = originalData;

    // Normalize the search query by trimming and reducing multiple spaces to a single space
    const normalizedSearchQuery = searchQuery
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .toLowerCase(); // Make the search query lowercase

    // Apply search filter
    if (normalizedSearchQuery) {
      filteredData = filteredData.filter((listing) => {
        const fullOwnerName =
          `${listing.owner.first_name} ${listing.owner.last_name}`.toLowerCase();
        const normalizedListingName = listing.listing_name.toLowerCase();
        const normalizedCategory = listing.category.toLowerCase();

        return (
          normalizedListingName.includes(normalizedSearchQuery) ||
          normalizedCategory.includes(normalizedSearchQuery) ||
          fullOwnerName.includes(normalizedSearchQuery)
        );
      });
    }

    // Apply filters for status or other columns
    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (listing) => listing.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

    if (Object.keys(sortOptions).length > 0) {
      if (sortOptions["Title"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Title"] === "asc"
            ? a.listing_name.localeCompare(b.listing_name)
            : b.listing_name.localeCompare(a.listing_name)
        );
      }

      if (sortOptions["Date Added"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Date Added"] === "newest"
            ? new Date(b.created_at) - new Date(a.created_at)
            : new Date(a.created_at) - new Date(b.created_at)
        );
      }
    }

    return sorted;
  };

  const sortedFilteredData = sortedData();

  // Pagination logic
  const totalItems = sortedFilteredData.length;
  const totalPages = Math.ceil(totalItems / listingsPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * listingsPerPage,
    currentPage * listingsPerPage
  );

  const data = displayedData.map((listing) => {
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

  return (
    <div className="admin-content-container">
      <div className="row">
        {/* Left Side: Recent Listings */}
        <div className="col-lg-8">
          <div className="recent-listings-header p-3 mb-3">
            <h4>Recent Listings</h4>

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
          {/* New Listings Widget */}
          <div className="mb-3 p-3 bg-white rounded shadow-sm">
            <h5>New Listings</h5>
            <div className="new-listings d-flex">
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

          {/* Top Listings Widget */}
          <div className="p-3 bg-white rounded shadow-sm">
            <h5>Top Listings</h5>
            <div className="top-listings">
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

export default ListingDashboard;
