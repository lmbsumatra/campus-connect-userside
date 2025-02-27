import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RentProgress.css";
import item1 from "../../assets/images/item/item_1.jpg";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import ReportModal from "../../components/report/ReportModalRental";

function RentProgress() {
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const { userId } = useAuth();
  const { id } = useParams();
  const [showReportModal, setShowReportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch transaction data every 5 seconds.
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/rental-transaction/${id}`
        );
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

  // Log the fetched status only when transaction is available.
  useEffect(() => {
    if (transaction && transaction.rental) {
      console.log("Fetched status:", transaction.rental.status);
    }
  }, [transaction]);

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  const handleSendMessage = () => {
    // Navigate to messaging interface or open a chat modal
    alert("Messaging functionality will be implemented here");
  };

  const calculateTotalCost = () => {
    if (!transaction || !transaction.rental || !transaction.rental.Listing)
      return 0;
    const rate = parseFloat(transaction.rental.Listing.rate) || 0;
    const days = transaction.rental.duration || 1;
    return (rate * days).toFixed(2);
  };

  // Called when the report modal form is submitted.
  const handleRentalReportSubmit = async (reportData) => {
    try {
      const formData = new FormData();
      formData.append("reporter_id", reportData.reporter_id);
      formData.append("reported_entity_id", reportData.reported_entity_id);
      formData.append("entity_type", reportData.entity_type);
      formData.append("reason", reportData.reason);
      formData.append("is_dispute", reportData.is_dispute);

      if (reportData.evidence && reportData.evidence.length > 0) {
        reportData.evidence.forEach((evidence, index) => {
          formData.append(`files`, evidence.file);
          formData.append(`file_types[${index}]`, evidence.file_type);
          formData.append(`uploaded_by[${index}]`, evidence.uploaded_by);
        });
      }

      await axios.post("http://localhost:3001/api/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Report submitted successfully!");
      setShowReportModal(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }
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

  return (
    <div className="rent-progress-wrapper">
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
                className={`progress-step ${step.completed ? "completed" : ""}`}
              >
                <div className="step-circle">{step.id}</div>
                <div className="step-name">{step.name}</div>
                {step.id < getProgressSteps().length && (
                  <div
                    className={`step-line ${step.completed ? "completed" : ""}`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div className="transaction-details">
            <h3>Transaction Details</h3>
            <div className="item-info">
              <img
                src={transaction.rental?.Listing?.image_url || item1}
                alt={transaction.rental?.Listing?.listing_name || "Item"}
              />
              <div className="item-details">
                <p>
                  <strong>Item:</strong>{" "}
                  {transaction.rental?.Listing?.listing_name}
                </p>
                <p>
                  <strong>Rental Period:</strong>{" "}
                  {transaction.rental?.Date?.date || "N/A"}
                </p>
                <p>
                  <strong>Rental Rate:</strong>{" "}
                  {transaction.rental?.Listing?.rate} php
                </p>
                <p>
                  <strong>Total Cost:</strong> {calculateTotalCost()} php
                </p>
              </div>
            </div>
          </div>

          <div className="delivery-info">
            <h3>Delivery Information</h3>
            <p>
              <strong>Method:</strong>{" "}
              {transaction.rental?.delivery_method || "Not specified"}
            </p>
            {transaction.rental?.delivery_address && (
              <p>
                <strong>Address:</strong> {transaction.rental.delivery_address}
              </p>
            )}
            {transaction.rental?.delivery_notes && (
              <p>
                <strong>Notes:</strong> {transaction.rental.delivery_notes}
              </p>
            )}
          </div>

          <div className="borrower-info">
            <h3>Borrower Information</h3>
            <div className="borrower-card">
              <div className="borrower-avatar">
                {transaction.rental?.renter?.profile_pic ? (
                  <img
                    src={transaction.rental.renter.profile_pic}
                    alt="Profile"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {transaction.rental?.renter?.first_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="borrower-details">
                <p className="borrower-name">
                  <strong>
                    {transaction.rental?.renter?.first_name}{" "}
                    {transaction.rental?.renter?.last_name}
                  </strong>
                </p>
                <p className="borrower-rating">
                  Rating:
                  <span className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < (transaction.rental?.renter?.rating || 0)
                            ? "star filled"
                            : "star"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </span>
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
          </div>

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
        entityType="rental_transaction"
        entityId={transaction.rental?.id}
        currentUserId={userId}
      />
    </div>
  );
}

export default RentProgress;
