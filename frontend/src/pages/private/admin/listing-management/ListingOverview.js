import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./listingDashboard.css";
import useFetchAllListingsData from "../../../../utils/FetchAllListingsData";
import { formatDate } from "../../../../utils/dateFormat";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import { ItemStatus } from "../../../../utils/Status";
import CardComponent from "../../../../components/Table/CardComponent"; 

const ListingOverview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [listingsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  

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

  // useEffect hook to set original data
  useEffect(() => {
    if (listings.length) {
      setOriginalData(listings);
    }
  }, [listings]);

  const handleView = (listingId) => {
    navigate(`/admin/listings/listing-approval/${listingId}`);
  };

  const handleEdit = (listingId) => {
    console.log(`Editing listing with ID: ${listingId}`);
  };

  const handleDelete = (listingId) => {
    console.log(`Deleting listing with ID: ${listingId}`);
  };

  const getStatusInfo = (status) => {
    const { label, className } = ItemStatus(status);
    return { label, className };
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

  // Filter the data
  const filteredData = getFilteredData();

  // Apply sorting on filtered data
  const sortedData = () => {
    let sorted = [...filteredData];

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

  // Get the sorted data
  const sortedFilteredData = sortedData();

  // Pagination logic: slice the sorted and filtered data
  const totalListings = sortedFilteredData.length;
  const totalPages = Math.ceil(totalListings / listingsPerPage);

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

  
  const handleSwitchView = (view) => {
    setViewMode(view);
  };


  return (
    <div className="admin-content-container">
      <div className="row">
        <div className="col-lg-12">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Listings</h4>

            {/* Show loading or error message */}
            {loading && <p>Loading posts...</p>}
            {error && <p>Error: {error}</p>}

            {/* Search Bar Component */}
            <SearchBarComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

       {/* View switcher */}
       <div className="admin-view-toggle">
            <button onClick={() => handleSwitchView("table")} className={`btn btn-secondary mb-4 ${viewMode === "table" ? "active" : ""}`}>Table View</button>
            <button onClick={() => handleSwitchView("card")} className={`btn btn-secondary mb-4 ${viewMode === "card" ? "active" : ""}`}>Card View</button>
          </div>

          {/* Conditionally render Table or Card View */}
          {viewMode === "table" ? (
            <TableComponent
              headers={headers}
              data={data}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
            />
          ) : (
            <CardComponent data={data} headers={headers}/>

          )}

            {/* Pagination Component */}
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingOverview;
