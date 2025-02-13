import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./AdminTransactionDashboard.css";
import useFetchAllTransactionsData from "../../../../utils/FetchAllTransactionsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import { TransactionStatus} from "../../../../utils/Status";
import CardComponent from "../../../../components/Table/CardComponent"; 

const AdminTransactionOverview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");

  const headers = [
    "Transaction ID",
    "Type",
    "Buyer/Renter",
    "Seller/Owner",
    "Amount",
    "Date",
    "Status",
    "Action",
  ];

  const { transactions, error, loading } = useFetchAllTransactionsData();

  useEffect(() => {
    if (transactions.length) {
      setOriginalData(transactions);
    }
  }, [transactions]);

  const handleView = (transactionId) => {
    navigate(`/admin/transactions/view/${transactionId}`);
  };

  const getStatusInfo = (status) => {
    const { label, className } = TransactionStatus(status);
    return { label, className };
  };
  
  const filterableStatusOptions = [
    "Requested",
    "Accepted",
    "Declined",
    "HandedOver",
    "Returned",
    "Completed",
    "Cancelled",
    "HandOver", // For BuyAndSellTransaction
    "Review"    // For BuyAndSellTransaction
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

    const normalizedSearchQuery = searchQuery
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    if (normalizedSearchQuery) {
      filteredData = filteredData.filter((transaction) => {
        const participantNames = `${transaction.buyer?.first_name || transaction.renter?.first_name} ${
          transaction.buyer?.last_name || transaction.renter?.last_name
        } ${transaction.seller?.first_name || transaction.owner?.first_name} ${
          transaction.seller?.last_name || transaction.owner?.last_name
        }`.toLowerCase();
        const normalizedDate = formatDate(transaction.createdAt).toLowerCase();
        return (
          participantNames.includes(normalizedSearchQuery) ||
          normalizedDate.includes(normalizedSearchQuery)
        );
      });
    }

    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (transaction) => transaction.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

    if (Object.keys(sortOptions).length > 0) {
      if (sortOptions["Date"]) {
        sorted = sorted.sort((a, b) =>
          sortOptions["Date"] === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    }

    return sorted;
  };

  const sortedFilteredData = sortedData();

  const totalItems = sortedFilteredData.length;
  const totalPages = Math.ceil(totalItems / transactionsPerPage);

  const displayedData = sortedFilteredData.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  const data = displayedData.map((transaction) => {
    const { label, className } = getStatusInfo(transaction.status);
    return [
      transaction.id,
      transaction.type,
      <>{transaction.buyer?.first_name || transaction.renter?.first_name} {transaction.buyer?.last_name || transaction.renter?.last_name}</>,
      <>{transaction.seller?.first_name || transaction.owner?.first_name} {transaction.seller?.last_name || transaction.owner?.last_name}</>,
      transaction.amount || "N/A",
      formatDate(transaction.createdAt),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(transaction.id)}
        >
          View
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
          <SearchBarComponent
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          {loading && <p>Loading ...</p>}
          {error && <p>Error: {error}</p>}
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
              statusOptions={filterableStatusOptions} 
            />
          ) : (
            <CardComponent data={data} headers={headers}/>

          )}
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionOverview;
