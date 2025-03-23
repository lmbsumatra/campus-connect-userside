import React, { useState } from "react";
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

  const handleImageClick = (imageSrc) => {
    setPreviewImage(imageSrc);
  };

  const handleVerifyStudent = async () => {
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
          statusMessage: statusMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update student status");
      }

      alert("Student status updated successfully!");
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating student status:", error);
      alert("Failed to update student status.");
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
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="verification-container">
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading user data...</p>
        </div>
      ) : errorMessage ? (
        <div className="error-message">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <p>{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="verification-header">
            <h2>Student Verification</h2>
            <div className="header-actions">
              <button
                className={`status-badge ${getStatusBadgeClass(
                  student.status
                )}`}
              >
                {student.status}
              </button>
              <button
                className="btn-verify"
                type="button"
                onClick={() => setShowModal(true)}
              >
                Change Status
              </button>
            </div>
          </div>

          <div className="verification-content">
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

            <div className="verification-documents">
              <h3>Verification Documents</h3>
              <div className="documents-grid">
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
              </div>
            </div>
          </div>
        </>
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
          <p>Please select a new status and provide a reason:</p>
          <div className="status-selector">
            <div className="form-group">
              <label htmlFor="statusSelect">Status</label>
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
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="statusMessage">Status Reason/Feedback:</label>
              <textarea
                className="form-control"
                id="statusMessage"
                rows="3"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder={
                  selectedStatus === "verified"
                    ? "Verification approved"
                    : selectedStatus === "pending"
                    ? "Additional verification needed"
                    : selectedStatus === "flagged"
                    ? "Reason for flagging"
                    : "Reason for ban"
                }
              ></textarea>
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
            Confirm
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
