import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/dateFormat";
import { TransactionStatus } from "../../../../utils/Status";
import "./ViewTransaction.css";
import { baseApi } from "../../../../utils/consonants";

const ViewTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`${baseApi}/rental-transaction/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch transaction details.");
        }
        const data = await response.json();
        setTransaction(data.rental);
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (loading)
    return (
      <div
        className="view-transaction-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <div className="loading-spinner">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="view-transaction-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-back" onClick={() => navigate(-1)}>
            <span>←</span> Go Back
          </button>
        </div>
      </div>
    );

  if (!transaction)
    return (
      <div className="view-transaction-container">
        <div className="error-message">
          <h3>No Data Found</h3>
          <p>The requested transaction could not be found.</p>
          <button className="btn btn-back" onClick={() => navigate(-1)}>
            <span>←</span> Go Back
          </button>
        </div>
      </div>
    );

  const { label, className } = TransactionStatus(transaction.status);

  // Format values properly
  const userName =
    transaction.buyer?.first_name || transaction.renter?.first_name;
  const userLastName =
    transaction.buyer?.last_name || transaction.renter?.last_name;
  const ownerName =
    transaction.seller?.first_name || transaction.owner?.first_name;
  const ownerLastName =
    transaction.seller?.last_name || transaction.owner?.last_name;
  const amount = transaction.Listing?.rate || transaction.ItemForSale?.price;
  const itemName =
    transaction.Listing?.listing_name ||
    transaction.ItemForSale?.item_for_sale_name;
  const category =
    transaction.Listing?.category || transaction.ItemForSale?.category;

  return (
    <div className="view-transaction-container">
      <div className="transaction-page-header">
        <h2>Transaction Details</h2>
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          <span>←</span> Back
        </button>
      </div>

      <div className="transaction-meta">
        <div className="meta-item">
          <div className="meta-label">ID</div>
          <div className="meta-value">{transaction.id}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Type</div>
          <div className="meta-value">{transaction.transaction_type}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Status</div>
          <div className="meta-value">
            <span className={`badge ${className}`}>{label}</span>
          </div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Date</div>
          <div className="meta-value">{formatDate(transaction.createdAt)}</div>
        </div>
      </div>

      <div className="transaction-details">
        <div className="detail-item">
          <div className="detail-label">Buyer/Renter</div>
          <div className="detail-value">
            {userName && userLastName ? `${userName} ${userLastName}` : "N/A"}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Seller/Owner</div>
          <div className="detail-value">
            {ownerName && ownerLastName
              ? `${ownerName} ${ownerLastName}`
              : "N/A"}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Amount</div>
          <div className="detail-value">{amount ? `$${amount}` : "N/A"}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Payment Status</div>
          <div className="detail-value">{transaction.payment_status}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Payment Mode</div>
          <div className="detail-value">{transaction.payment_mode}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Delivery Method</div>
          <div className="detail-value">{transaction.delivery_method}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Item Name</div>
          <div className="detail-value">{itemName || "N/A"}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Category</div>
          <div className="detail-value">{category || "N/A"}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Post Item Name</div>
          <div className="detail-value">
            {transaction.Post?.post_item_name || "N/A"}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Rental Date</div>
          <div className="detail-value">{transaction.Date?.date || "N/A"}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Rental Time</div>
          <div className="detail-value">
            {transaction.Duration?.rental_time_from &&
            transaction.Duration?.rental_time_to
              ? `${transaction.Duration.rental_time_from} - ${transaction.Duration.rental_time_to}`
              : "N/A"}
          </div>
        </div>

        {/* <div className="detail-item">
          <div className="detail-label">Owner Confirmed</div>
          <div className="detail-value">
            <div className="indicator">
              <span
                className={`indicator-dot ${
                  transaction.owner_confirmed ? "yes" : "no"
                }`}
              ></span>
              {transaction.owner_confirmed ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Renter Confirmed</div>
          <div className="detail-value">
            <div className="indicator">
              <span
                className={`indicator-dot ${
                  transaction.renter_confirmed ? "yes" : "no"
                }`}
              ></span>
              {transaction.renter_confirmed ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Allowed to Proceed</div>
          <div className="detail-value">
            <div className="indicator">
              <span
                className={`indicator-dot ${
                  transaction.is_allowed_to_proceed ? "yes" : "no"
                }`}
              ></span>
              {transaction.is_allowed_to_proceed ? "Yes" : "No"}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ViewTransaction;
