import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ReportItemView.css";

const ReportItemView = () => {
  const { entity_type, reported_entity_id } = useParams();
  const [entityDetails, setEntityDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        <div className="entity-details">
          {Object.entries(entityDetails).map(([key, value]) => (
            <div className="entity-row" key={key}>
              <span className="entity-label">{key.replace(/_/g, " ")}</span>
              <span className="entity-value">
                {typeof value === "object" ? JSON.stringify(value) : value || "N/A"}
              </span>
            </div>
          ))}

          {/* Display renter or seller details if available */}
          {(entityDetails.renter || entityDetails.seller || entityDetails.owner) && (
            <div className="entity-details">
                <h4>{entityDetails.renter || entityDetails.owner? "Renter Details" : "Seller Details"}</h4>
                <div className="entity-row">
                <span className="entity-label">First Name:</span>
                <span className="entity-value">
                    {(entityDetails.renter || entityDetails.seller || entityDetails.owner).first_name || "N/A"}
                </span>
                </div>
                <div className="entity-row">
                <span className="entity-label">Last Name:</span>
                <span className="entity-value">
                    {(entityDetails.renter || entityDetails.seller || entityDetails.owner).last_name || "N/A"}
                </span>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportItemView;
