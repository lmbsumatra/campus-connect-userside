import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./forSaleManagement.css";
import useFetchAllItemsForSaleData from "../../../../utils/FetchAllItemsForSaleData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import {
  ItemsByCategory,
  ListingGrowth,
  ItemStatusDistribution,
  TopSellers,
  RevenueTrends,
} from "../../../../components/Analytics/SaleAnalyticsComponents";

const ForSaleManagement = () => {
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
    "Seller",
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

  const getStatusInfo = (status) => {
    const { label, className } = ItemStatus(status);
    return { label, className };
  };

  const filterableStatusOptions = [
    "pending",
    "approved",
    "declined",
    "removed",
    // "revoked",
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

    if (searchQuery) {
      const normalizedSearchQuery = searchQuery
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

      filteredData = filteredData.filter((item) => {
        const normalizedPostItemName =
          item.item_for_sale_name?.toLowerCase() || "";
        const normalizedCategory = item.category?.toLowerCase() || "";
        const fullSellerName = `${item.seller?.first_name || ""} ${
          item.seller?.last_name || ""
        }`.toLowerCase();

        // Format the date (assuming created_at is the date field)
        const normalizedDate = formatDate(item.created_at).toLowerCase(); // Adjust based on your date format

        return (
          normalizedPostItemName.includes(normalizedSearchQuery) || // Include Title in search
          normalizedCategory.includes(normalizedSearchQuery) || // Category search
          fullSellerName.includes(normalizedSearchQuery) || // Seller name search
          normalizedDate.includes(normalizedSearchQuery) // Date search
        );
      });
    }

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

      if (sortOptions["Renter"]) {
        sorted = sorted.sort((a, b) => {
          const renterA =
            `${a.seller.first_name} ${a.seller.last_name}`.toLowerCase();
          const renterB =
            `${b.seller.first_name} ${b.seller.last_name}`.toLowerCase();

          return sortOptions["Renter"] === "asc"
            ? renterA.localeCompare(renterB)
            : renterB.localeCompare(renterA);
        });
      }
    }

    return sorted;
  };

  const sortedFilteredData = sortedData();

  const totalItems = sortedFilteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getThumbnail = (item) => {
    let imagesArray = [];

    if (typeof item.images === "string") {
      try {
        imagesArray = JSON.parse(item.images);
      } catch (error) {
        console.error("Error parsing images:", error);
      }
    } else if (Array.isArray(item.images)) {
      imagesArray = item.images;
    }

    const imageUrl =
      imagesArray.length > 0 && typeof imagesArray[0] === "string"
        ? imagesArray[0].trim()
        : "https://via.placeholder.com/100";

    return (
      <img
        src={imageUrl}
        alt={item.item_for_sale_name}
        className="items-thumbnail"
        // onError={(e) => {
        //   console.error("❌ Image failed to load:", e.target.src);
        //   e.target.src = "https://via.placeholder.com/100";
        // }}
      />
    );
  };
  const data = displayedData.map((item) => {
    const { label, className } = getStatusInfo(item.status);
    return [
      getThumbnail(item),
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
      </div>,
    ];
  });

  return (
    <div className="admin-content-container">
      <div className="row">
        <div className="col-lg-8">
          <div className="recent-items-header p-3 mb-3">
            <h4>Recent Sale</h4>
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
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        <div className="col-lg-4 analytics-section">
          {/* Analytics Widgets */}
          <ItemsByCategory items={items} />
          <ListingGrowth items={items} />
          <ItemStatusDistribution items={items} />
          <TopSellers items={items} />
          <RevenueTrends items={items} />
        </div>
      </div>
    </div>
  );
};

export default ForSaleManagement;
