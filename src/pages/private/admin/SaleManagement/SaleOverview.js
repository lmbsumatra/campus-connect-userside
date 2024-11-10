import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./forSaleManagement.css";
import useFetchAllItemsForSaleData from "../../../../utils/FetchAllItemsForSaleData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import { ItemStatus } from "../../../../utils/Status";

const SaleOverview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);

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

  // Set original data when items are fetched
  useEffect(() => {
    if (items.length) {
      setOriginalData(items);
    }
  }, [items]);

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

  // Apply filters first
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

    // Apply filters from the filter options (e.g., Status, Category)
    if (filterOptions["Category"]) {
      filteredData = filteredData.filter(
        (item) => item.category === filterOptions["Category"]
      );
    }

    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (item) => item.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  // Apply sorting on filtered data
  const sortedData = () => {
    let sorted = [...getFilteredData()];

    if (Object.keys(sortOptions).length > 0) {
      if (sortOptions["Title"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Title"] === "asc"
            ? a.post_item_name.localeCompare(b.post_item_name)
            : b.post_item_name.localeCompare(a.post_item_name)
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

  // Get the sorted and filtered data
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
      item.post_item_name,
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
        <div className="col-lg-12">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Sales</h4>

            {/* Loading or Error Message */}
            {loading && <p>Loading posts...</p>}
            {error && <p>Error: {error}</p>}

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
      </div>
    </div>
  );
};

export default SaleOverview;
