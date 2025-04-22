import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RentProgress.css";
import item1 from "../../assets/images/item/item_1.jpg";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReportModal from "../../components/report/ReportModalRental";
import { baseApi } from "../../utils/consonants";
import { formatDate } from "../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../utils/timeFormat";
import useGoBack from "../backNav.jsx";
import { useDispatch } from "react-redux";
import { submitTransactionReport } from "../../redux/reports/RentalReportsSlice";
import AlreadyReportedModal from "./ReportedModal.jsx";

function RentProgress() {
  const goBack = useGoBack();
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { studentUser } = useAuth();
  const userId = studentUser ? studentUser.userId : null;
  const { id } = useParams();
  const [showReportModal, setShowReportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const [hasExistingReport, setHasExistingReport] = useState(false);
  const [existingReportId, setExistingReportId] = useState(null);
  const [showAlreadyReportedModal, setShowAlreadyReportedModal] =
    useState(false);

  // Get reports from Redux store
  const { transactionReportsByUser } = useSelector(
    (state) => state.transactionReportsByUser
  );

  // Fetch transaction data every 5 seconds.
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`${baseApi}/rental-transaction/${id}`);
        setTransaction(response.data);
      } catch (err) {
        setError(
          err.response
            ? err.response.data.error
            : "An error occurred while fetching the transaction."
        );
      }
    };

    fetchTransaction();
    const interval = setInterval(fetchTransaction, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Check for existing reports when data loads
  useEffect(() => {
    if (transaction?.rental?.id && transactionReportsByUser) {
      const existing = transactionReportsByUser.find(
        (report) => report.rental_transaction_id === transaction.rental.id
      );
      setHasExistingReport(!!existing);
      setExistingReportId(existing?.id);
    }
  }, [transaction, transactionReportsByUser]);

  // Log the fetched status only when transaction is available.
  useEffect(() => {
    if (transaction && transaction.rental) {
      console.log("Fetched status:", transaction);
    }
  }, [transaction]);

  useEffect(() => {
    if (studentUser && studentUser.token) {
      console.log(
        "Auth token available:",
        studentUser.token.substring(0, 10) + "..."
      );
    } else {
      console.log("No auth token available in context");
    }
  }, [studentUser]);

  const getUserType = () => {
    if (!transaction || !transaction.rental) return null;

    console.log(userId);

    const { rental } = transaction;

    // Check if user is the owner by comparing with owner_id
    if (rental.owner_id === userId) return "owner";

    // Check if user is the buyer in a sale transaction
    if (rental.transaction_type === "sell" && rental.buyer_id === userId)
      return "buyer";

    // Check if user is the renter in a rental transaction
    if (rental.transaction_type === "rental" && rental.renter_id === userId)
      return "renter";

    return "guest"; // User is not related to this transaction
  };

  const userType = getUserType();
  const isRentalTransaction =
    transaction?.rental?.transaction_type === "rental";
  const isSaleTransaction = transaction?.rental?.transaction_type === "sell";

  // Modified report click handler
  const handleReportClick = () => {
    if (hasExistingReport) {
      setShowAlreadyReportedModal(true);
    } else {
      setShowReportModal(true);
    }
  };

  const handleSendMessage = () => {
    // Determine whether the user is the owner or the other party
    const isOwner = transaction.rental?.owner?.user_id === userId;
    let recipientId;

    if (isRentalTransaction) {
      recipientId = isOwner
        ? transaction.rental?.renter?.user_id
        : transaction.rental?.owner?.user_id;
    } else if (isSaleTransaction) {
      recipientId = isOwner
        ? transaction.rental?.buyer?.user_id
        : transaction.rental?.owner?.user_id;
    }

    if (!recipientId) {
      alert("Recipient information not available");
      return;
    }

    // Format date to a readable string
    const formattedDate = transaction.rental?.Date?.date
      ? new Date(transaction.rental.Date.date).toLocaleDateString()
      : "Not specified";

    // Get the correct item name and image
    const itemName = isRentalTransaction
      ? transaction.rental?.Listing?.listing_name || "Rental Transaction"
      : transaction.rental?.ItemForSale?.item_for_sale_name ||
        "Sale Transaction";

    const itemImage = isRentalTransaction
      ? transaction.rental?.Listing?.image_url || item1
      : transaction.rental?.ItemForSale?.images
      ? JSON.parse(transaction.rental?.ItemForSale?.images)[0]
      : item1;

    const itemPrice = isRentalTransaction
      ? transaction.rental?.Listing?.rate || "0"
      : transaction.rental?.ItemForSale?.price || "0";

    // Navigate to messages with transaction details
    navigate("/messages", {
      state: {
        ownerId: recipientId,
        product: {
          productId: transaction.rental.id,
          name: itemName,
          price: itemPrice,
          image: itemImage,
          title: "Inquiry",
          type: isRentalTransaction ? "rental-transaction" : "sale-transaction",
          status: `Status: ${
            transaction.rental?.status?.replace("_", " ") || "N/A"
          }
Period: ${formattedDate}
Delivery: ${transaction.rental?.delivery_method || "Not specified"}
Total Cost: ${transaction.rental?.amount || calculateTotalCost()} php`,
        },
      },
    });
  };

  const calculateTotalCost = () => {
    if (isRentalTransaction) {
      if (!transaction || !transaction.rental || !transaction.rental.Listing)
        return 0;
      const rate = parseFloat(transaction.rental.Listing.rate) || 0;
      const days = transaction.rental.duration || 1;
      return (rate * days).toFixed(2);
    } else {
      if (
        !transaction ||
        !transaction.rental ||
        !transaction.rental.ItemForSale
      )
        return 0;
      return parseFloat(transaction.rental.ItemForSale.price).toFixed(2);
    }
  };

  // Called when the report modal form is submitted.
  const handleRentalReportSubmit = async (reportData) => {
    const { reason, evidence } = reportData;
    const transactionId = transaction.rental?.id;
    const transactionType = transaction.rental?.transaction_type;

    // Check if token exists
    if (!studentUser || !studentUser.token) {
      console.error("No authentication token available");
      alert(
        "You need to be logged in to submit a report. Please log in and try again."
      );
      return;
    }

    console.log("Using token:", studentUser.token.substring(0, 10) + "...");

    dispatch(
      submitTransactionReport({
        transactionId,
        transactionType,
        reason,
        files: evidence.map((e) => e.file),
        token: studentUser.token,
      })
    )
      .unwrap()
      .then(() => {
        alert("Report submitted successfully!");
        setShowReportModal(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        alert(error.error || "Failed to submit report.");
      });
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!transaction) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transaction details...</p>
      </div>
    );
  }

  // Define progress steps based on current status.
  const getProgressSteps = () => {
    const status = transaction.rental?.status?.toLowerCase() || "";
    const statusOrder = [
      "requested",
      "confirmed",
      "in_progress",
      "returned",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(status);
    return [
      { id: 1, name: "Requested", completed: currentIndex >= 0 },
      { id: 2, name: "Confirmed", completed: currentIndex >= 1 },
      { id: 3, name: "In Progress", completed: currentIndex >= 2 },
      { id: 4, name: "Returned", completed: currentIndex >= 3 },
      { id: 5, name: "Completed", completed: currentIndex >= 4 },
    ];
  };

  // For mobile view, show only current and adjacent steps.
  const getMobileProgressSteps = () => {
    const allSteps = getProgressSteps();
    const currentStepIndex = allSteps.findIndex(
      (step) =>
        step.completed && !allSteps[allSteps.indexOf(step) + 1]?.completed
    );

    if (currentStepIndex === -1) {
      return allSteps.slice(0, 3);
    }

    const startIndex = Math.max(0, currentStepIndex - 1);
    const endIndex = Math.min(allSteps.length, currentStepIndex + 2);
    return allSteps.slice(startIndex, endIndex);
  };

  const progressSteps = isMobile
    ? getMobileProgressSteps()
    : getProgressSteps();

  // Get the right images for rendering
  const getItemImage = () => {
    if (isRentalTransaction && transaction.rental?.Listing?.images) {
      return JSON.parse(transaction.rental.Listing.images)[0] || item1;
    } else if (isSaleTransaction && transaction.rental?.ItemForSale?.images) {
      return JSON.parse(transaction.rental.ItemForSale.images)[0] || item1;
    }
    return item1;
  };

  return (
    <>
      <div className="rent-progress-wrapper">
        <button className="btn btn-secondary" onClick={goBack}>
          Back
        </button>
        <div className="rent-progress">
          <div className="progress-container">
            <div className="transaction-header">
              <h2>Transaction ID: {transaction.rental?.id}</h2>
              <span className={`status status-${transaction.rental?.status}`}>
                Status:{" "}
                {transaction.rental?.status
                  ? transaction.rental.status.replace("_", " ").toUpperCase()
                  : "N/A"}
              </span>
            </div>

            <div className="progress-tracker">
              {getProgressSteps().map((step) => (
                <div
                  key={step.id}
                  className={`progress-step ${
                    step.completed ? "completed" : ""
                  }`}
                >
                  <div className="step-circle">{step.id}</div>
                  <div className="step-name">{step.name}</div>
                  {step.id < getProgressSteps().length && (
                    <div
                      className={`step-line ${
                        step.completed ? "completed" : ""
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <div className="transaction-details mb-3">
              <h3 className="details-heading">Transaction Details</h3>
              <div className="item-info">
                <div className="item-image-container">
                  <img src={getItemImage()} alt="Item" className="item-image" />
                </div>
                <div className="item-details">
                  <div className="detail-row">
                    <span className="detail-label">Item:</span>
                    <span className="detail-value">
                      {isRentalTransaction &&
                        transaction.rental?.Listing?.listing_name}
                      {isSaleTransaction &&
                        transaction.rental?.ItemForSale?.item_for_sale_name}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      {isRentalTransaction
                        ? "Rental Period"
                        : "Transaction Date"}
                      :
                    </span>
                    <span className="detail-value">
                      {formatDate(transaction.rental?.Date?.date) || "Unknown"}
                      {transaction.rental?.Duration && (
                        <span className="time-period">
                          (
                          {formatTimeTo12Hour(
                            transaction.rental.Duration.rental_time_from
                          )}
                          {" - "}
                          {formatTimeTo12Hour(
                            transaction.rental.Duration.rental_time_to
                          )}
                          )
                        </span>
                      )}
                    </span>
                  </div>

                  {isRentalTransaction && (
                    <div className="detail-row">
                      <span className="detail-label">Rental Rate:</span>
                      <span className="detail-value">
                        {transaction.rental?.Listing?.rate} php
                      </span>
                    </div>
                  )}

                  {isRentalTransaction &&
                    transaction.rental?.Listing?.security_deposit && (
                      <div className="detail-row">
                        <span className="detail-label">Security Deposit:</span>
                        <span className="detail-value">
                          {transaction.rental?.Listing?.security_deposit} php
                          (Refunded after transation)
                        </span>
                      </div>
                    )}

                  {isRentalTransaction &&
                    transaction.rental?.Listing?.late_charges && (
                      <div className="detail-row">
                        <span className="detail-label">Late Charges:</span>
                        <span className="detail-value">
                          {transaction.rental?.Listing?.late_charges} php
                          (Collected after transaction when applicable)
                        </span>
                      </div>
                    )}

                  {isSaleTransaction && (
                    <div className="detail-row">
                      <span className="detail-label">Sale Price:</span>
                      <span className="detail-value">
                        {transaction.rental?.ItemForSale?.price} php
                      </span>
                    </div>
                  )}

                  <div className="detail-row total-cost">
                    <span className="detail-label">Total Cost:</span>
                    <span className="detail-value">
                      {transaction.rental?.amount || calculateTotalCost()} php
                      (Late charges not included)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="delivery-info">
              <h3 className="section-heading">Delivery Information</h3>
              <div className="info-content">
                <div className="info-row">
                  <span className="info-label">Method:</span>
                  <span className="info-value">
                    {transaction.rental?.delivery_method || "Not specified"}
                  </span>
                </div>

                {(transaction.rental?.Listing?.location ||
                  transaction.rental?.ItemForSale?.location) && (
                  <div className="info-row">
                    <span className="info-label">
                      {transaction.rental?.delivery_method
                        ?.charAt(0)
                        .toUpperCase() +
                        transaction.rental?.delivery_method?.slice(1)}{" "}
                      Location:
                    </span>
                    <span className="info-value">
                      {transaction.rental?.Listing?.location ||
                        transaction.rental?.ItemForSale?.location}
                    </span>
                  </div>
                )}

                {transaction.rental?.delivery_notes && (
                  <div className="info-row">
                    <span className="info-label">Notes:</span>
                    <span className="info-value">
                      {transaction.rental.delivery_notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="borrower-info">
              <h3 className="section-heading">
                {userType === "owner"
                  ? isSaleTransaction
                    ? "Buyer Info"
                    : "Renter Info"
                  : isSaleTransaction
                  ? "Owner Info"
                  : "Owner Info"}
              </h3>

              <div className="info-content">
                {userType === "owner" &&
                  isRentalTransaction &&
                  transaction.rental?.renter && (
                    <div className="borrower-card">
                      <div className="borrower-avatar">
                        {transaction.rental.renter.profile_pic ? (
                          <img
                            src={transaction.rental.renter.profile_pic}
                            alt={`${transaction.rental.renter.first_name} ${transaction.rental.renter.last_name}`}
                            onError={(e) => {
                              e.target.src = "/default-avatar.jpg";
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {transaction.rental.renter.first_name?.charAt(0) ||
                              "?"}
                          </div>
                        )}
                      </div>

                      <div className="borrower-details">
                        <p className="borrower-name">
                          <strong>
                            {transaction.rental.renter.first_name}{" "}
                            {transaction.rental.renter.last_name}
                          </strong>
                        </p>
                        <div className="borrower-actions">
                          <button
                            className="btn-rent message-btn"
                            onClick={handleSendMessage}
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {userType === "owner" &&
                  isSaleTransaction &&
                  transaction.rental?.buyer && (
                    <div className="borrower-card">
                      <div className="borrower-avatar">
                        {transaction.rental.buyer.profile_pic ? (
                          <img
                            src={transaction.rental.buyer.profile_pic}
                            alt={`${transaction.rental.buyer.first_name} ${transaction.rental.buyer.last_name}`}
                            onError={(e) => {
                              e.target.src = "/default-avatar.jpg";
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {transaction.rental.buyer.first_name?.charAt(0) ||
                              "?"}
                          </div>
                        )}
                      </div>

                      <div className="borrower-details">
                        <p className="borrower-name">
                          <strong>
                            {transaction.rental.buyer.first_name}{" "}
                            {transaction.rental.buyer.last_name}
                          </strong>
                        </p>
                        <div className="borrower-actions">
                          <button
                            className="btn-rent message-btn"
                            onClick={handleSendMessage}
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {(userType === "renter" || userType === "buyer") &&
                  transaction.rental?.owner && (
                    <div className="borrower-card">
                      <div className="borrower-avatar">
                        {transaction.rental.owner.profile_pic ? (
                          <img
                            src={transaction.rental.owner.profile_pic}
                            alt={`${transaction.rental.owner.first_name} ${transaction.rental.owner.last_name}`}
                            onError={(e) => {
                              e.target.src = "/default-avatar.jpg";
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {transaction.rental.owner.first_name?.charAt(0) ||
                              "?"}
                          </div>
                        )}
                      </div>

                      <div className="borrower-details">
                        <p className="borrower-name">
                          <strong>
                            {transaction.rental.owner.first_name}{" "}
                            {transaction.rental.owner.last_name}
                          </strong>
                        </p>
                        <div className="borrower-actions">
                          <button
                            className="btn-rent message-btn"
                            onClick={handleSendMessage}
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {userType === "guest" && (
                  <div className="info-message error">
                    <p>
                      You do not have permission to view this transaction's
                      details.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(transaction.rental?.handover_proof ||
              transaction.rental?.return_proof ||
              transaction.rental?.sale_completion_proof) && (
              <div className="transaction-proof-section mt-4">
                <h3 className="details-heading">Submitted Proofs</h3>

                {transaction.rental?.handover_proof && (
                  <div
                    className="proof-preview"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <span className="text-gray">Handover Proof:</span>
                    <img
                      src={transaction.rental.handover_proof}
                      alt="Handover Proof"
                      className="proof-image"
                    />
                  </div>
                )}

                {transaction.rental?.return_proof && (
                  <div
                    className="proof-preview "
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <span className="text-gray">Return Proof:</span>
                    <img
                      src={transaction.rental.return_proof}
                      alt="Return Proof"
                      className="proof-image"
                    />
                  </div>
                )}

                {transaction.rental?.sale_completion_proof && (
                  <div
                    className="proof-preview"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <span className="text-gray">Sale Completion Proof:</span>
                    <img
                      src={transaction.rental.sale_completion_proof}
                      alt="Sale Completion Proof"
                      className="proof-image"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="actions-container">
              <button
                className="btn-rent btn-rectangle danger report-btn"
                onClick={handleReportClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="report-icon"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Report Issue
              </button>
            </div>
          </div>
        </div>

        <ReportModal
          show={showReportModal}
          handleClose={() => setShowReportModal(false)}
          handleSubmit={handleRentalReportSubmit}
          entityType={
            isSaleTransaction ? "sale_transaction" : "rental_transaction"
          }
          entityId={transaction.rental?.id}
          currentUserId={userId}
          transactionType={transaction.rental?.transaction_type}
        />

        <AlreadyReportedModal
          show={showAlreadyReportedModal}
          onClose={() => setShowAlreadyReportedModal(false)}
          onViewDetails={(reportId) => {
            navigate(`/reports/${reportId}`);
            setShowAlreadyReportedModal(false);
          }}
          reportId={existingReportId}
        />
      </div>
    </>
  );
}

export default RentProgress;
