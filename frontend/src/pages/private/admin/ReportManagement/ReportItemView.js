import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ReportItemView.css";
import PostEntityView from "./ReportItemDetails/PostEntityView";
import ListingEntityView from "./ReportItemDetails/ListingEntityView";
import SaleEntityView from "./ReportItemDetails/SaleEntityView";
import UserEntityView from "./ReportItemDetails/UserEntityView";
import ReportActionModal from "../../../../components/report/ReportActionModal";
import { useAuth } from "../../../../context/AuthContext";
import { baseApi } from "../../../../utils/consonants";
import ShowAlert from "../../../../utils/ShowAlert";
import { useDispatch } from "react-redux";

const ReportItemView = () => {
  const { adminUser } = useAuth();
  const { entity_type, reported_entity_id } = useParams();
  const location = useLocation();
  const { reportDetails } = location.state || {};
  const [entityDetails, setEntityDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const dispatch = useDispatch();

  // Entity type label mapping
  const entityTypeLabels = {
    post: "Post",
    listing: "Listing",
    sale: "Sale Item",
    user: "User Profile",
  };

  useEffect(() => {
    const fetchEntityDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseApi}/api/reports/details`, {
          params: { entity_type, entity_id: reported_entity_id },
          headers: {
            Authorization: `Bearer ${adminUser.token}`,
          },
        });
        setEntityDetails(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching entity details");
        ShowAlert(
          dispatch,
          "error",
          "Data Error",
          "Failed to load report details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (adminUser?.token && reported_entity_id) {
      fetchEntityDetails();
    }
  }, [entity_type, reported_entity_id, adminUser, dispatch]);

  const handleBack = () => navigate("/admin/reports");

  const renderEntityView = () => {
    switch (entity_type) {
      case "post":
        return <PostEntityView entityDetails={entityDetails} />;
      case "listing":
        return <ListingEntityView entityDetails={entityDetails} />;
      case "sale":
        return <SaleEntityView entityDetails={entityDetails} />;
      case "user":
        return <UserEntityView entityDetails={entityDetails} />;
      default:
        return <div>Invalid entity type.</div>;
    }
  };

  const handleStatusChange = async (
    selectedAction,
    entityAction,
    statusMessage
  ) => {
    try {
      const response = await axios.patch(
        `${baseApi}/api/reports/${reportDetails.id}`,
        {
          reportId: reportDetails.id,
          reportStatus: selectedAction,
          entityAction: entityAction,
          statusMessage: statusMessage,
          lastUpdated: new Date().toISOString(),
          reviewedBy: `${adminUser.firstName} ${adminUser.lastName}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminUser.token}`,
          },
        }
      );

      if (response.status === 200) {
        reportDetails.status = selectedAction;
        reportDetails.lastUpdated = new Date().toISOString();
        reportDetails.reviewedBy = `${adminUser.firstName} ${adminUser.lastName}`;
        ShowAlert(
          dispatch,
          "success",
          "Report Status",
          "Report status changed successfully."
        );
      }
    } catch (error) {
      if (error.response?.status === 403) {
        ShowAlert(
          dispatch,
          "error",
          "Unauthorized",
          "You do not have permission to perform this action."
        );
      } else {
        ShowAlert(
          dispatch,
          "error",
          "Error",
          error.response?.data?.message || "Failed to update report status."
        );
      }
      console.error("Error updating status:", error);
    } finally {
      handleCloseModal();
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-badge status-pending";
      case "reviewed":
        return "status-badge status-reviewed";
      case "rejected":
        return "status-badge status-rejected";
      default:
        return "status-badge";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading)
    return <div className="loading-container">Loading report details...</div>;

  if (error)
    return (
      <div className="error-container">
        <div>Error loading report details</div>
        <p>{error}</p>
        <div className="mt-3">
          <button onClick={handleBack} className="btn btn-secondary">
            Back to Reports
          </button>
        </div>
      </div>
    );

  return (
    <div className="report-item-view-container">
      <div className="header">
        <h2>Report Review</h2>
        <button onClick={handleBack} className="btn btn-secondary">
          Back to Reports
        </button>
      </div>

      <div className="entity-card">
        <h3>
          <span className="card-icon">📋</span>
          {entityTypeLabels[entity_type] || "Entity"} Details
        </h3>
        {renderEntityView()}
      </div>

      <div className="report-details">
        <h3>
          <span className="card-icon">🚩</span>
          Report Information
        </h3>
        <p>
          <strong>Reporter:</strong>
          <span>{reportDetails?.reporter || "Anonymous"}</span>
        </p>

        <div className="reason-box">
          <div className="reason-title">Reported Reason:</div>
          <div className="reason-text">
            {reportDetails?.reason || "No reason specified"}
          </div>
        </div>

        <p>
          <strong>Current Status:</strong>
          <span className={getStatusBadgeClass(reportDetails?.status)}>
            {reportDetails?.status || "Pending"}
          </span>
        </p>

        <p>
          <strong>Date Reported:</strong>
          <span className="timestamp">
            {formatDate(reportDetails?.createdAt)}
          </span>
        </p>

        {reportDetails?.lastUpdated && (
          <p>
            <strong>Last Updated:</strong>
            <span className="timestamp">
              {formatDate(reportDetails.lastUpdated)}
            </span>
          </p>
        )}

        {reportDetails?.reviewedBy && (
          <p>
            <strong>Reviewed By:</strong>
            <span>{reportDetails.reviewedBy}</span>
          </p>
        )}
      </div>

      <div className="action-container">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleOpenModal}
          disabled={
            reportDetails?.status === "reviewed" ||
            reportDetails?.status === "dismissed"
          }
        >
          {reportDetails?.status === "reviewed"
            ? "Already Reviewed"
            : reportDetails?.status === "dismissed"
            ? "Dismissed"
            : "Take Action"}
        </button>
      </div>

      <ReportActionModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleStatusChange}
        currentStatus={reportDetails?.status}
        entityType={entity_type}
      />
    </div>
  );
};

export default ReportItemView;
