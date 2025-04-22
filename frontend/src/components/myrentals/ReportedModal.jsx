import React from "react";
import PropTypes from "prop-types";
import { AlertCircle } from "lucide-react";

const AlreadyReportedModal = ({ show, onClose, onViewDetails, reportId }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AlertCircle size={48} color="#3b82f6" />
        </div>
        <p>You have already reported this transaction.</p>
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onViewDetails(reportId)}
          >
            See Details
          </button>
        </div>
      </div>
    </div>
  );
};

AlreadyReportedModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  reportId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AlreadyReportedModal;
