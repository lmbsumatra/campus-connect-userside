import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./forSaleManagement.css";
import useFetchAllItemsForSaleData from "../../../../utils/FetchAllItemsForSaleData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent"; // Import SearchBar
import PaginationComponent from "../../../../components/Pagination/PaginationComponent"; // Import Pagination Component

const ForSaleManagement = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [sortOptions, setSortOptions] = useState({}); // Sort options state
  const [filterOptions, setFilterOptions] = useState({}); // Filter options state
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [itemsPerPage] = useState(10); // Items per page
  const [originalData, setOriginalData] = useState([]); // State for storing original data

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
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length) {
      setOriginalData(items);
    }
  }, [items]);

  if (loading) return <p>Loading items...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleView = (itemId) => {
    navigate(`/admin/sales/item-approval/${itemId}`);
  };

  const handleEdit = (itemId) => {
    console.log(`Editing item with ID: ${itemId}`);
  };

  const handleDelete = (itemId) => {
    console.log(`Deleting item with ID: ${itemId}`);
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

  // Function to filter items based on search query
  const getFilteredData = () => {
    let filteredData = originalData;

    // Apply search filter
    if (searchQuery) {
      // Normalize the search query by trimming and reducing multiple spaces to a single space
      const normalizedSearchQuery = searchQuery
        .trim()
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .toLowerCase(); // Convert search query to lowercase

      filteredData = filteredData.filter((item) => {
        // Normalize the fields (post_item_name, category, and seller's name)
        const normalizedPostItemName = item.post_item_name.toLowerCase();
        const normalizedCategory = item.category.toLowerCase();
        const fullSellerName =
          `${item.seller.first_name} ${item.seller.last_name}`.toLowerCase();

        // Check if any of the fields match the normalized search query
        return (
          normalizedPostItemName.includes(normalizedSearchQuery) ||
          normalizedCategory.includes(normalizedSearchQuery) ||
          fullSellerName.includes(normalizedSearchQuery)
        );
      });
    }

    // Apply filters for status or other columns
    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (item) => item.status === filterOptions["Status"]
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
            ? a.item_for_sale_name.localeCompare(b.item_for_sale_name)
            : b.item_for_sale_name.localeCompare(a.item_for_sale_name)
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
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const data = displayedData.map((item) => {
    const { label, className } = getStatusInfo(item.status);
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

  return (
    <div className="admin-content-container">
      <div className="row">
        {/* Left Side: Recent Items for Sale */}
        <div className="col-lg-8">
          <div className="recent-items-header p-3 mb-3">
            <h4>Recent Sale</h4>

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
          {/* New Sale Widget */}
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

          {/* Top Sale Widget */}
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
