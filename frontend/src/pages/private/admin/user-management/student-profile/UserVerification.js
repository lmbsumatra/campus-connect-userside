import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import FetchUserInfoForAdmin from "../../../../../utils/FetchUserInfoAdmin";
import { Modal, Button } from "react-bootstrap";
import { useAuth } from "../../../../../context/AuthContext";
import "./userVerification.css";
import { baseApi } from "../../../../../utils/consonants";

const UserVerification = () => {
  const { adminUser } = useAuth();
  const { id } = useParams();
  const { user, student, loading, errorMessage } = FetchUserInfoForAdmin(id);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("verified");
  const [statusMessage, setStatusMessage] = useState("");

  // Update selectedStatus when student data loads
  useEffect(() => {
    if (student?.status) {
      setSelectedStatus(student.status);
      setStatusMessage(student.statusMessage || ""); // Pre-fill message if exists
    }
  }, [student]);

  const handleImageClick = (imageSrc) => {
    setPreviewImage(imageSrc);
  };

  const handleVerifyStudent = async () => {
    if (
      ["flagged", "banned", "restricted"].includes(selectedStatus) &&
      !statusMessage.trim()
    ) {
      alert(
        `Please provide a reason/feedback for setting the status to ${selectedStatus}.`
      );
      return;
    }

    try {
      const response = await fetch(`${baseApi}/admin/change-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({
          studentId: student.id,
          status: selectedStatus,
          statusMessage: statusMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update student status");
      }

      alert("Student status updated successfully!");
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating student status:", error);
      alert(`Failed to update student status: ${error.message}`);
    }
  };

  // Get badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "verified":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "flagged":
        return "badge-danger";
      case "banned":
        return "badge-dark";

      case "restricted":
        return "badge-info";

      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="verification-container">
      {loading ? (
        <div className="loading-spinner text-center">
          {" "}
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading user data...</p>
        </div>
      ) : errorMessage ? (
        <div className="error-message alert alert-danger">
          {" "}
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
          {errorMessage}
        </div>
      ) : user && student ? (
        <>
          <div className="verification-header">
            <h2>Student Verification</h2>
            <div className="header-actions">
              <span
                className={`status-badge ${getStatusBadgeClass(
                  student.status
                )}`}
              >
                {" "}
                {student.status}
              </span>
              <button
                className="btn-verify ms-2"
                type="button"
                onClick={() => setShowModal(true)}
              >
                {" "}
                Change Status
              </button>
            </div>
          </div>

          <div className="verification-content">
            {/* User Profile Card */}
            <div className="user-profile-card">
              <div className="profile-header">
                <h3>User Information</h3>
              </div>
              <div className="profile-body">
                <div className="profile-item">
                  <span className="profile-label">Full Name</span>
                  <span className="profile-value">
                    {user.fname} {user.mname} {user.lname}
                  </span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Email Verified</span>
                  <span className="profile-value">
                    <span
                      className={`verification-badge ${
                        user.emailVerified ? "verified" : "unverified"
                      }`}
                    >
                      {user.emailVerified ? "Yes" : "No"}
                    </span>
                  </span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Join Date</span>
                  <span className="profile-value">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Information Card */}
            <div className="user-profile-card">
              <div className="profile-header">
                <h3>Student Information</h3>
              </div>
              <div className="profile-body">
                <div className="profile-item">
                  <span className="profile-label">TUP ID</span>
                  <span className="profile-value">{student.tupId}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">College</span>
                  <span className="profile-value">{student.college}</span>
                </div>
                {student.statusMessage && (
                  <div className="profile-item">
                    <span className="profile-label">Status Reason</span>
                    <span className="profile-value status-message">
                      {student.statusMessage}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Documents */}
            <div className="verification-documents">
              <h3>Verification Documents</h3>
              <div className="documents-grid">
                {/* Profile Pic */}
                {student.profilePic && (
                  <div className="document-card">
                    <h4>Profile Picture</h4>
                    <div className="document-image-container">
                      <img
                        src={student.profilePic}
                        alt="Profile"
                        onClick={() => handleImageClick(student.profilePic)}
                      />
                      <div className="image-overlay">
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Scanned ID */}
                {student.scannedId && (
                  <div className="document-card">
                    <h4>Scanned ID</h4>
                    <div className="document-image-container">
                      <img
                        src={student.scannedId}
                        alt="Scanned ID"
                        onClick={() => handleImageClick(student.scannedId)}
                      />
                      <div className="image-overlay">
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Photo with ID */}
                {student.photoWithId && (
                  <div className="document-card">
                    <h4>Photo with ID</h4>
                    <div className="document-image-container">
                      <img
                        src={student.photoWithId}
                        alt="Student ID verification"
                        onClick={() => handleImageClick(student.photoWithId)}
                      />
                      <div className="image-overlay">
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Handle case where no documents are available */}
                {!student.profilePic &&
                  !student.scannedId &&
                  !student.photoWithId && (
                    <p className="text-muted">
                      No verification documents submitted.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Fallback if user/student data couldn't be loaded but no specific error message
        <div className="error-message alert alert-warning">
          Could not load user or student details.
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="verification-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Student Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Select a new status and provide a reason/feedback (required for
            Flagged, Banned, Restricted):
          </p>
          <div className="status-selector">
            <div className="form-group mb-3">
              {" "}
              <label htmlFor="statusSelect" className="form-label">
                Status
              </label>{" "}
              <select
                id="statusSelect"
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
                <option value="banned">Banned</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="statusMessage" className="form-label">
                Status Reason/Feedback:
              </label>{" "}
              <textarea
                className="form-control"
                id="statusMessage"
                rows="3"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder={
                  selectedStatus === "verified"
                    ? "Account meets verification requirements."
                    : selectedStatus === "pending"
                    ? "Account needs further review or document submission."
                    : selectedStatus === "flagged"
                    ? "Reason for flagging (e.g., unclear documents, suspicious activity)."
                    : selectedStatus === "banned"
                    ? "Reason for permanent ban (e.g., policy violation, fraud)."
                    : selectedStatus === "restricted"
                    ? "Reason for temporary restriction (Note: Expiry set via reports)."
                    : ""
                }
                required={["flagged", "banned", "restricted"].includes(
                  selectedStatus
                )}
              ></textarea>
              {["flagged", "banned", "restricted"].includes(selectedStatus) &&
                !statusMessage.trim() && (
                  <small className="text-danger">
                    Reason is required for this status.
                  </small>
                )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            className={`status-change-btn ${selectedStatus}`}
            onClick={handleVerifyStudent}
          >
            Confirm Change
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        show={!!previewImage}
        onHide={() => setPreviewImage(null)}
        centered
        size="lg"
        className="image-preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewImage && (
            <div className="preview-image-container">
              <img src={previewImage} alt="Enlarged View" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setPreviewImage(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserVerification;
