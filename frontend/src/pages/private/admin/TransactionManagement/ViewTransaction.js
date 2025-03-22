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
    const fetchTransaction = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/rental-transaction/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transaction details.");
        }
        const data = await response.json();
        console.log("Backend response:", data);
        setTransaction(data.rental); // Assuming the backend returns { success: true, rental: {...} }
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
  if (!transaction) return <p>No transaction data found.</p>;

  const { label, className } = TransactionStatus(transaction.status);

  return (
    <div className="view-transaction-container">
      <h2>Transaction Details</h2>
      <button className="btn btn-back" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="transaction-details">
        <p>
          <strong>Transaction ID:</strong> {transaction.id}
        </p>
        <p>
          <strong>Type:</strong> {transaction.transaction_type}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`badge ${className}`}>{label}</span>
        </p>
        <p>
          <strong>Buyer/Renter:</strong>{" "}
          {transaction.buyer?.first_name || transaction.renter?.first_name}{" "}
          {transaction.buyer?.last_name || transaction.renter?.last_name}
        </p>
        <p>
          <strong>Seller/Owner:</strong>{" "}
          {transaction.seller?.first_name || transaction.owner?.first_name}{" "}
          {transaction.seller?.last_name || transaction.owner?.last_name}
        </p>
        <p>
          <strong>Amount:</strong> {transaction.amount || "N/A"}
        </p>
        <p>
          <strong>Date:</strong> {formatDate(transaction.createdAt)}
        </p>
        <p>
          <strong>Delivery Method:</strong> {transaction.delivery_method}
        </p>
        <p>
          <strong>Payment Status:</strong> {transaction.payment_status}
        </p>
        <p>
          <strong>Payment Mode:</strong> {transaction.payment_mode}
        </p>
        <p>
          <strong>Listing Name:</strong> {transaction.Listing?.listing_name}
        </p>
        <p>
          <strong>Category:</strong> {transaction.Listing?.category}
        </p>
        <p>
          <strong>Post Item Name:</strong> {transaction.Post?.post_item_name}
        </p>
        <p>
          <strong>Rental Date:</strong> {transaction.Date?.date}
        </p>
        <p>
          <strong>Rental Time:</strong> {transaction.Duration?.rental_time_from}{" "}
          - {transaction.Duration?.rental_time_to}
        </p>
        <p>
          <strong>Owner Confirmed:</strong>{" "}
          {transaction.owner_confirmed ? "Yes" : "No"}
        </p>
        <p>
          <strong>Renter Confirmed:</strong>{" "}
          {transaction.renter_confirmed ? "Yes" : "No"}
        </p>
        <p>
          <strong>Allowed to Proceed:</strong>{" "}
          {transaction.is_allowed_to_proceed ? "Yes" : "No"}
        </p>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
};

export default ViewTransaction;
