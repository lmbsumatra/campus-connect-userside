import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./listingDashboard.css";
import useFetchAllListingsData from "../../../../utils/FetchAllListingsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent"; // Import SearchBar
import PaginationComponent from "../../../../components/Pagination/PaginationComponent"; // Import Pagination Component
import {
  ListingsGrowth,
  ListingsByCategory,
  ListingStatusTrends,
  TopUsersForListings,
  ListingPriceDistribution,
} from "../../../../components/Analytics/ListingAnalyticsComponent";

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

  const getStatusInfo = (status) => {
    const { label, className } = ItemStatus(status);
    return { label, className };
  };

  const filterableStatusOptions = [
    "pending",
    "approved",
    "declined",
    "removed",
    "revoked",
    "flagged",
  ];

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
        const normalizedDateAdded = formatDate(
          listing.created_at
        ).toLowerCase(); // Format the date and convert to lowercase

        return (
          normalizedListingName.includes(normalizedSearchQuery) || // Title search
          normalizedCategory.includes(normalizedSearchQuery) || // Category search
          fullOwnerName.includes(normalizedSearchQuery) || // Owner search
          normalizedDateAdded.includes(normalizedSearchQuery) // Date Added search
        );
      });
    }

    // Apply Category filter (if implemented in filterOptions)
    if (filterOptions["Category"]) {
      filteredData = filteredData.filter(
        (listing) => listing.category === filterOptions["Category"]
      );
    }

    // Apply Status filter
    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (listing) => listing.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

    // Always sort by Date Added (newest first) if no sort option is selected
    if (!sortOptions["Date Added"]) {
      sorted = sorted.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

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

            <TableComponent
              headers={headers}
              data={data}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
              statusOptions={filterableStatusOptions}
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
          <ListingsGrowth listings={listings} />
          <ListingsByCategory listings={listings} />
          <ListingStatusTrends listings={listings} />
          <TopUsersForListings listings={listings} />
          <ListingPriceDistribution listings={listings} />
        </div>
      </div>
    </div>
  );
};

export default ListingDashboard;
