import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./transactionStyles.css";
import { formatDate } from "../../../utils/dateFormat";
import { GCASH } from "../../../utils/consonants";

const TransactionsTable = ({ transactions }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    paymentMethod: "",
    transactionType: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const rowsPerPage = 5;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesPaymentMethod = filter.paymentMethod
      ? transaction.paymentMethod === filter.paymentMethod
      : true;
    const matchesTransactionType = filter.transactionType
      ? transaction.transactionType === filter.transactionType
      : true;
    const matchesStatus = filter.status
      ? transaction.status === filter.status
      : true;

    return matchesPaymentMethod && matchesTransactionType && matchesStatus;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const order = sortConfig.direction === "asc" ? 1 : -1;

    let aValue, bValue;

    switch (sortConfig.key) {
      case "amount":
        aValue = parseFloat(a.totalAmount);
        bValue = parseFloat(b.totalAmount);
        break;
      case "date":
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case "itemName":
        aValue = a.itemName || "";
        bValue = b.itemName || "";
        break;
      default:
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
    }

    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortArrow = (column) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <i className="fas fa-arrow-up"></i>
    ) : (
      <i className="fas fa-arrow-down"></i>
    );
  };

  return (
    <div className="mt-2">
      <div className="transactions-table-container">
        <h3>Transactions</h3>
        <table className="transactions-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>ID {getSortArrow("id")}</th>
              <th onClick={() => handleSort("date")}>
                Date {getSortArrow("date")}
              </th>
              <th>
                Transaction Type
                <select
                  className="filter-dropdown"
                  value={filter.transactionType}
                  onChange={(e) =>
                    setFilter({ ...filter, transactionType: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option value="Rental">Rental</option>
                  <option value="Purchase">Purchase</option>
                </select>
              </th>
              <th>
                Payment Method
                <select
                  className="filter-dropdown"
                  value={filter.paymentMethod}
                  onChange={(e) =>
                    setFilter({ ...filter, paymentMethod: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option value="GCASH">Online Payment</option>
                  <option value="PAYMENT UPON MEETUP">
                    Payment Upon Meetup
                  </option>
                </select>
              </th>
              <th onClick={() => handleSort("amount")}>
                Amount {getSortArrow("amount")}
              </th>
              <th onClick={() => handleSort("itemName")}>
                Item Name {getSortArrow("itemName")}
              </th>
              <th>
                Status
                <select
                  className="filter-dropdown"
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option value="Requested">Requested</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.id}</td>
                  <td>{formatDate(transaction.createdAt)}</td>
                  <td>{transaction.transactionType}</td>
                  <td>
                    {transaction.paymentMethod === "GCASH"
                      ? "ONLINE PAYMENT"
                      : "PAYMENT UPON MEETUP"}
                  </td>
                  <td>₱{transaction.totalAmount}</td>
                  <td>{transaction.itemName}</td>
                  <td>{transaction.status}</td>
                  <td>
                    <button
                      className="table-edit-btn"
                      onClick={() => {
                        const routePrefix =
                          transaction.transactionType === "Rental"
                            ? "/transaction-progress/"
                            : "/transaction-progress/";
                        navigate(`${routePrefix}${transaction.id}`);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-transactions">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-primary"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
