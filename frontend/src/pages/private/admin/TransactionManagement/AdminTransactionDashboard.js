import React, { useState, useEffect } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./AdminTransactionDashboard.css";
import useFetchAllRentalTransactionData from "../../../../utils/FetchAllRentalTransactionsData";
import { formatDate } from "../../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import SearchBarComponent from "../../../../components/Search/SearchBarComponent";
import PaginationComponent from "../../../../components/Pagination/PaginationComponent";
import {
  TransactionStatusDistribution,
  TransactionsGrowth,
  PaymentModeDistribution,
  TransactionFunnelAnalysis,
} from "../../../../components/Analytics/TransactionAnalyticsComponent";
import { TransactionStatus } from "../../../../utils/Status";

const AdminTransactionDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const navigate = useNavigate();

  const headers = [
    "Transaction ID",
    "Type",
    "Buyer/Renter",
    "Seller/Owner",
    "Name",
    "Date",
    "Status",
    "Action",
  ];

  const { transactions, error, loading } = useFetchAllRentalTransactionData();

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
        const participantNames = `${
          transaction.buyer?.first_name || transaction.renter?.first_name
        } ${transaction.buyer?.last_name || transaction.renter?.last_name} ${
          transaction.seller?.first_name || transaction.owner?.first_name
        } ${
          transaction.seller?.last_name || transaction.owner?.last_name
        }`.toLowerCase();
        const normalizedDate = formatDate(transaction.createdAt).toLowerCase();
        return (
          participantNames.includes(normalizedSearchQuery) ||
          normalizedDate.includes(normalizedSearchQuery)
        );
      });
    }

    // Ensure the filter logic for "Type" works correctly
    if (filterOptions["Type"] && filterOptions["Type"] !== "all") {
      filteredData = filteredData.filter(
        (transaction) =>
          transaction.transaction_type.toLowerCase() ===
          filterOptions["Type"].toLowerCase()
      );
    }
    // Ensure the filter logic for "Status" works correctly
    if (filterOptions["Status"]) {
      filteredData = filteredData.filter(
        (transaction) => transaction.status === filterOptions["Status"]
      );
    }

    return filteredData;
  };

  const sortedData = () => {
    let sorted = [...getFilteredData()];

    // Default sorting by Date Added (newest first) if no sorting option is selected
    if (!sortOptions["Date Added"]) {
      sorted = sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

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
      transaction.transaction_type,
      <>
        {transaction.buyer?.first_name || transaction.renter?.first_name}{" "}
        {transaction.buyer?.last_name || transaction.renter?.last_name}
      </>,
      <>
        {transaction.seller?.first_name || transaction.owner?.first_name}{" "}
        {transaction.seller?.last_name || transaction.owner?.last_name}
      </>,
      transaction.Listing?.listing_name ||
        transaction.ItemForSale?.item_for_sale_name ||
        "N/A",
      // transaction.amount || "N/A",
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

  return (
    <div className="admin-content-container">
      <div className="row">
        <div className="col-lg-8">
          <div className="recent-transactions-header  p-3 mb-3">
            <h4>Recent Transactions</h4>
            <SearchBarComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            {loading && <p>Loading ...</p>}
            {error && <p>Error: {error}</p>}
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
        <div className="col-lg-4">
          <TransactionStatusDistribution transactions={transactions} />
          <TransactionsGrowth transactions={transactions} />
          <PaymentModeDistribution transactions={transactions} />
          <TransactionFunnelAnalysis transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDashboard;
