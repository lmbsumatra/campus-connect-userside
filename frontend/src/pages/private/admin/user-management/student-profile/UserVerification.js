import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../userDashboard.css";
import { useParams } from "react-router-dom";
import FetchUserInfoForAdmin from "../../../../../utils/FetchUserInfoAdmin";
import { Modal, Button } from "react-bootstrap";
import { baseApi } from "../../../../../App";
import { useAuth } from "../../../../../context/AuthContext";

const UserVerification = () => {
  const { adminUser } = useAuth();
  const { id } = useParams();
  const { user, student, loading, errorMessage } = FetchUserInfoForAdmin(id);

  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("verified"); // Default status
  const [statusMessage, setStatusMessage] = useState(""); // New state for status message

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
          statusMessage: statusMessage, // Include the status message
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update student status");
      }

      alert("Student status updated successfully!");
      setShowModal(false);
      window.location.reload(); // Refresh the page to reflect changes
    } catch (error) {
      console.error("Error updating student status:", error);
      alert("Failed to update student status.");
    }
  };

  return (
    <div className="admin-content-container">
      <div className="gap-3 d-flex">
        <div className="profile-content m-0 p-0 lh-0 w-50">
          {loading ? (
            <p>Loading user data...</p>
          ) : errorMessage ? (
            <p className="text-danger">{errorMessage}</p>
          ) : (
            <div className="user-info">
              <h3>User Information</h3>
              <p>
                <strong>Name:</strong> {user.fname} {user.mname} {user.lname}
              </p>
              <p>
                <strong>Email Verified:</strong>{" "}
                {user.emailVerified ? "Yes" : "No"}
              </p>
              <p>
                <strong>Join Date:</strong>{" "}
                {new Date(user.joinDate).toLocaleDateString()}
              </p>

              <h3>Student Information</h3>
              <p>
                <strong>TUP ID:</strong> {student.tupId}
              </p>
              <p>
                <strong>College:</strong> {student.college}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    student.status === "verified"
                      ? "text-success"
                      : "text-warning"
                  }
                >
                  {student.status}
                </span>
              </p>

              {/* Display status message if available */}
              {student.statusMessage && (
                <p>
                  <strong>Status Reason:</strong> {student.statusMessage}
                </p>
              )}

              {student.profilePic && (
                <div>
                  <h4>Profile Picture</h4>
                  <img
                    src={student.profilePic}
                    alt="Profile"
                    width="150px"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleImageClick(student.profilePic)}
                  />
                </div>
              )}

              {student.scannedId && (
                <div>
                  <h4>Scanned ID</h4>
                  <img
                    src={student.scannedId}
                    alt="Scanned ID"
                    width="150px"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleImageClick(student.scannedId)}
                  />
                </div>
              )}

              {student.photoWithId && (
                <div>
                  <h4>Photo with ID</h4>
                  <img
                    src={student.photoWithId}
                    alt="Student ID verification"
                    width="150px"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleImageClick(student.photoWithId)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-rectangle primary no-fill my-3 me-4 btn-lg"
          type="button"
          onClick={() => setShowModal(true)}
        >
          Verify Student
        </button>
      </div>

      {/* Verification Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Verify Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to change this student's status?</p>
          <select
            className="form-select mb-3"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="banned">Banned</option>
          </select>

          {/* Add status message input */}
          <div className="mb-3">
            <label htmlFor="statusMessage" className="form-label">
              Status Reason/Feedback:
            </label>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVerifyStudent}>
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
      >
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewImage && (
            <img
              src={previewImage}
              alt="Enlarged View"
              style={{ width: "100%", maxHeight: "90vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserVerification;
