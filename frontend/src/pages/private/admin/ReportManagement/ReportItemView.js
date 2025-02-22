import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ReportItemView.css";
import PostEntityView from "./ReportItemDetails/PostEntityView";
import ListingEntityView from "./ReportItemDetails/ListingEntityView";
import SaleEntityView from "./ReportItemDetails/SaleEntityView";
import UserEntityView from "./ReportItemDetails/UserEntityView";
import ReportActionModal from "../../../../components/report/ReportActionModal";



const ReportItemView = () => {
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

  useEffect(() => {
    const fetchEntityDetails = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/reports/details", {
          params: { entity_type, entity_id: reported_entity_id },
        });
        setEntityDetails(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching entity details");
      } finally {
        setLoading(false);
      }
    };

    fetchEntityDetails();
  }, [entity_type, reported_entity_id]);

  const handleBack = () => navigate("/admin/reports");

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

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

  const handleStatusChange = async (selectedAction, entityAction) => {
    try {
      await axios.patch(`http://localhost:3001/api/reports/${reportDetails.id}`, {
        reportId: reportDetails.id, // Include reportId in the payload
        reportStatus: selectedAction,
        entityAction: entityAction, // Include entityAction if applicable
       
      });
      reportDetails.status = selectedAction; // Update UI
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      handleCloseModal();
    }
  };


 
  return (
    <div className="report-item-view-container">
      <div className="header">
        <h2>Report Item View</h2>
        <button onClick={handleBack} className="btn btn-secondary">
          Back to Reports
        </button>
      </div>
      <div className="entity-card">
        <h3>Entity Details</h3>
        {renderEntityView()}
      </div>
      {/* Report Details Section */}
      <div className="report-details">
        <h3>Report Details</h3>
        <p><strong>Reporter:</strong> {reportDetails?.reporter}</p>
        <p><strong>Reason:</strong> {reportDetails?.reason}</p>
        <p><strong>Status:</strong> {reportDetails?.status}</p>
        <p><strong>Date Added:</strong> {reportDetails?.createdAt}</p>
      </div>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button className="btn btn-primary btn-lg mt-2" onClick={handleOpenModal}>
          Action
        </button>
      </div>
      <ReportActionModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleStatusChange}
        currentStatus={reportDetails.status}
        entityType={entity_type} 
      />
    </div>
  );
};

export default ReportItemView;
