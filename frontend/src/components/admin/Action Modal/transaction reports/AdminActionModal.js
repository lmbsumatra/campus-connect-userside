import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { baseApi } from "../../../../utils/consonants";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FiSend } from "react-icons/fi";
import { useDispatch } from "react-redux";
import ShowAlert from "../../../../utils/ShowAlert";
import "./AdminActionModal.css";

const adminStatusOptions = [
  { value: "admin_review", label: "Under Review" },
  { value: "admin_resolved", label: "Resolve Case" },
  { value: "admin_dismissed", label: "Dismiss Case" },
];

const adminActionOptions = [
  { value: "none", label: "No Action" },
  { value: "warning_issued", label: "Issue Warning" },
  { value: "temp_ban_24h", label: "Temporary Ban (24h)" },
  { value: "temp_ban_48h", label: "Temporary Ban (48h)" },
  { value: "temp_ban_72h", label: "Temporary Ban (72h)" },
  { value: "perm_ban", label: "Permanent Ban" },
];

const AdminActionModal = ({
  show,
  onHide,
  reportId,
  initialStatus,
  initialNotes = "",
  initialAction = "none",
  onActionSuccess,
}) => {
  const dispatch = useDispatch();
  const { adminUser } = useAuth();

  const [adminStatus, setAdminStatus] = useState(
    initialStatus || "admin_review"
  );
  const [resolutionNotes, setResolutionNotes] = useState(initialNotes);
  const [actionTaken, setActionTaken] = useState(initialAction);
  const [actionLoading, setActionLoading] = useState(false);

  // Reset form state
  useEffect(() => {
    if (show) {
      setAdminStatus(initialStatus || "admin_review");
      setResolutionNotes(initialNotes);
      setActionTaken(initialAction);
      setActionLoading(false); // Ensure loading state is reset
    }
  }, [show, initialStatus, initialNotes, initialAction]);

  const handleAdminActionSubmit = async (e) => {
    e.preventDefault();
    if (!adminUser?.token) {
      ShowAlert(dispatch, "error", "Auth Error", "Admin token not found.");
      return;
    }

    if (adminStatus === "admin_resolved" && actionTaken === "none") {
      if (
        !window.confirm(
          "You are resolving the case with 'No Action' selected. Are you sure?"
        )
      ) {
        return;
      }
    }

    if (
      !resolutionNotes.trim() &&
      (adminStatus === "admin_resolved" || adminStatus === "admin_dismissed")
    ) {
      ShowAlert(
        dispatch,
        "error",
        "Validation Error",
        "Resolution notes are required to resolve or dismiss the case."
      );
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        newStatus: adminStatus,
        resolutionNotes,
        // Only include actionTaken if status is resolved
        ...(adminStatus === "admin_resolved" && { actionTaken }),
      };

      await axios.put(
        `${baseApi}/api/transaction-reports/${reportId}/admin-action`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${adminUser.token}`,
          },
        }
      );

      await ShowAlert(
        dispatch,
        "success",
        "Action Submitted",
        "Report status updated successfully."
      );

      // Call the success callback passed from the parent
      if (onActionSuccess) {
        onActionSuccess();
      }
      onHide();
    } catch (err) {
      console.error("Error submitting admin action:", err);
      await ShowAlert(
        dispatch,
        "error",
        "Submission Error",
        err.response?.data?.error || "Failed to submit action."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Admin Action for Report #{reportId}</Modal.Title>
      </Modal.Header>
      {/* Use Form's onSubmit and link Footer button */}
      <Form onSubmit={handleAdminActionSubmit} id="adminActionForm">
        <Modal.Body>
          {/* Reuse class name or create a new one if preferred */}
          <div className="admin-action-form-content">
            <Form.Group className="mb-3">
              <Form.Label>Update Status</Form.Label>
              <Form.Select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
                disabled={actionLoading}
              >
                {adminStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Conditional Action Taken Dropdown */}
            {adminStatus === "admin_resolved" && (
              <Form.Group className="mb-3">
                <Form.Label>Action Taken Against Reported User</Form.Label>
                <Form.Select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  disabled={actionLoading}
                >
                  {adminActionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                Resolution Notes
                {/* Required indicator */}
                {(adminStatus === "admin_resolved" ||
                  adminStatus === "admin_dismissed") && (
                  <span className="text-danger"> *</span>
                )}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter notes about your decision..."
                disabled={actionLoading}
                required={
                  adminStatus === "admin_resolved" ||
                  adminStatus === "admin_dismissed"
                }
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="adminActionForm"
            className="submit-btn-admin"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="btn-spinner-admin me-2"
                />
                Submitting...
              </>
            ) : (
              <>
                <FiSend className="me-2" />
                Submit Action
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AdminActionModal;
