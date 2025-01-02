// frontend/src/pages/private/admin/TransactionManagement/ViewTransaction.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/dateFormat";
import { TransactionStatus } from "../../../../utils/Status";
import "./ViewTransaction.css";

const ViewTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // console.log("Fetching transaction with ID:", id);
    const fetchTransaction = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/admin/transactions/view/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch transaction details.");
          }
          const data = await response.json(); // Directly parse JSON
          setTransaction(data);
        } catch (error) {
          console.error("Error fetching transaction:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
    fetchTransaction();
  }, [id]);
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const { label, className } = TransactionStatus(transaction.status);

  return (
    <div className="view-transaction-container">
      <h2>Transaction Details</h2>
      <button className="btn btn-back" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="transaction-details">
        <p><strong>Transaction ID:</strong> {transaction.id}</p>
        <p><strong>Type:</strong> {transaction.type}</p>
        <p><strong>Status:</strong> <span className={`badge ${className}`}>{label}</span></p>
        <p><strong>Buyer/Renter:</strong> {transaction.buyer?.first_name || transaction.renter?.first_name} {transaction.buyer?.last_name || transaction.renter?.last_name}</p>
        <p><strong>Seller/Owner:</strong> {transaction.seller?.first_name || transaction.owner?.first_name} {transaction.seller?.last_name || transaction.owner?.last_name}</p>
        <p><strong>Amount:</strong> {transaction.amount || "N/A"}</p>
        <p><strong>Date:</strong> {formatDate(transaction.createdAt)}</p>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
};

export default ViewTransaction;
