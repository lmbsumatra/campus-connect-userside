import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { baseApi } from "../../../../utils/consonants";
import { Button, Col, Row, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { FiArrowLeft, FiPaperclip, FiSend } from "react-icons/fi";
import { useDispatch } from "react-redux";
import ShowAlert from "../../../../utils/ShowAlert";
import "./TransactionReportItem.css";

const TransactionReportItem = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { adminUser } = useAuth();

  const [reportDetails, setReportDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Admin action form state
  const [adminStatus, setAdminStatus] = useState("admin_review");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("none");

  // Status options
  const adminStatusOptions = [
    { value: "admin_review", label: "Under Review" },
    { value: "admin_resolved", label: "Resolve Case" },
    { value: "admin_dismissed", label: "Dismiss Case" },
  ];

  // Action options
  const adminActionOptions = [
    { value: "none", label: "No Action" },
    { value: "warning_issued", label: "Issue Warning" },
    { value: "temp_ban_24h", label: "Temporary Ban (24h)" },
    { value: "temp_ban_48h", label: "Temporary Ban (48h)" },
    { value: "temp_ban_72h", label: "Temporary Ban (72h)" },
    { value: "perm_ban", label: "Permanent Ban" },
  ];

  // Fetch report details
  const fetchReportDetails = useCallback(async () => {
    if (!adminUser?.token) {
      setError("Admin authentication required");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseApi}/api/transaction-reports/admin/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${adminUser.token}`,
          },
        }
      );
      setReportDetails(response.data);

      // If the report is escalated or admin_review, set that as default
      if (
        response.data &&
        (response.data.status === "escalated" ||
          response.data.status === "admin_review")
      ) {
        setAdminStatus(response.data.status);
      } else if (response.data) {
        // If resolved/dismissed, reflect that
        setAdminStatus(response.data.status);
        setResolutionNotes(response.data.admin_resolution_notes || "");
        setActionTaken(response.data.admin_action_taken || "none");
      }
    } catch (err) {
      console.error("Error fetching transaction report details:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to load report details"
      );
      ShowAlert(
        dispatch,
        "error",
        "Data Error",
        "Failed to load report details"
      );
    } finally {
      setLoading(false);
    }
  }, [reportId, adminUser?.token, dispatch]);

  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  // Handle admin action
  const handleAdminAction = async (e) => {
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
    // Require notes if resolving or dismissing
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
      fetchReportDetails(); // refresh
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

  // Convert status to the correct `-admin` class
  const getStatusClass = (statusValue) => {
    switch (statusValue?.toLowerCase()) {
      case "open":
        return "status-open-admin";
      case "under_review":
        return "status-in_progress-admin";
      case "resolved":
        return "status-resolved-admin";
      case "escalated":
      case "admin_review":
        return "status-escalated-admin";
      case "admin_resolved":
        return "status-resolved-admin";
      case "admin_dismissed":
        return "status-dismissed-admin"; // or "status-secondary-admin"
      default:
        return "status-secondary-admin";
    }
  };

  // Format date
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

  // Render evidence
  const renderEvidenceItem = (evidence, uploaderName = "Unknown") => {
    const isImage = evidence.file_path.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const isVideo = evidence.file_path.match(/\.(mp4|webm|ogg|mov|avi)$/i);
    const displayName =
      uploaderName === "Unknown" && evidence.uploader
        ? `${evidence.uploader.first_name} ${evidence.uploader.last_name}`
        : uploaderName;

    return (
      <Col
        xs={12}
        sm={6}
        md={6}
        lg={4}
        key={evidence.id}
        className="mb-3 evidence-col-admin"
      >
        <div className="evidence-item-admin">
          {isImage ? (
            <img
              src={evidence.file_path}
              alt={`Evidence ${evidence.id}`}
              className="evidence-img-admin"
            />
          ) : isVideo ? (
            <div className="file-preview-document-admin">
              <video controls className="evidence-video-admin w-100">
                <source
                  src={evidence.file_path}
                  type={`video/${evidence.file_path.split(".").pop()}`}
                />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="file-preview-document-admin">
              <FiPaperclip className="file-icon-admin" />
              <a
                href={evidence.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-link btn-sm"
              >
                View File
              </a>
            </div>
          )}
        </div>
      </Col>
    );
  };

  if (loading) {
    return (
      <div className="loading-container-admin">
        <Spinner animation="border" />
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-details-wrapper-admin">
        <Alert
          variant="danger"
          className="report-container-admin error-content-admin"
        >
          <Alert.Heading>Error Loading Report</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            <FiArrowLeft className="icon-left-admin" /> Back to Reports
          </Button>
        </Alert>
      </div>
    );
  }

  if (!reportDetails) {
    return (
      <div className="report-details-wrapper-admin">
        <Alert variant="warning" className="report-container-admin">
          Report details not found.
          <Button
            variant="outline-secondary"
            onClick={() => navigate(-1)}
            className="mt-3"
          >
            <FiArrowLeft className="icon-left-admin" /> Back to Reports
          </Button>
        </Alert>
      </div>
    );
  }

  // Separate evidence
  const initialEvidence =
    reportDetails.evidence?.filter(
      (ev) => !ev.transaction_report_response_id
    ) || [];

  return (
    <div className="report-details-wrapper-admin">
      <button className="back-button-admin" onClick={() => navigate(-1)}>
        <FiArrowLeft className="icon-left-admin" /> Back to Reports
      </button>

      <div className="report-container-admin">
        <div className="report-header-admin">
          <h2>
            Transaction Report #{reportDetails.id} -{" "}
            {reportDetails.transaction_type}
          </h2>
          <span
            className={`status-admin ${getStatusClass(reportDetails.status)}`}
          >
            {reportDetails.status.replace(/_/g, " ")}
          </span>
        </div>

        <Row className="report-content-row-admin">
          {/* Left Column */}
          <Col md={6} className="report-column-left-admin">
            {/* Report Details */}
            <div className="details-section-admin mb-4">
              <h3>Report Details</h3>
              <div className="detail-item-admin">
                <strong>Transaction ID:</strong>{" "}
                {reportDetails.rental_transaction_id || "N/A"}
              </div>
              <div className="detail-item-admin">
                <strong>Reporter:</strong>{" "}
                {reportDetails.reporter
                  ? `${reportDetails.reporter.first_name} ${reportDetails.reporter.last_name}`
                  : "N/A"}
              </div>
              <div className="detail-item-admin">
                <strong>Reported:</strong>{" "}
                {reportDetails.reported
                  ? `${reportDetails.reported.first_name} ${reportDetails.reported.last_name}`
                  : "N/A"}
              </div>
              <div className="detail-item-admin">
                <strong>Date Reported:</strong>{" "}
                {formatDate(reportDetails.createdAt)}
              </div>
            </div>

            {/* Description */}
            <div className="description-section-admin mb-4">
              <h3>Report Description</h3>
              <div className="description-text-admin">
                {reportDetails.report_description || "No description provided"}
              </div>
            </div>

            {/* Initial Evidence */}
            <div className="evidence-section-admin mb-4">
              {initialEvidence.length > 0 ? (
                <Row className="evidence-grid-row-admin g-3">
                  {initialEvidence.map((ev) =>
                    renderEvidenceItem(
                      ev,
                      reportDetails.reporter
                        ? `${reportDetails.reporter.first_name} ${reportDetails.reporter.last_name}`
                        : "Reporter"
                    )
                  )}
                </Row>
              ) : (
                <p className="no-evidence-admin">
                  No initial evidence provided.
                </p>
              )}
            </div>
          </Col>

          {/* Right Column */}
          <Col md={6} className="report-column-right-admin ps-md-4">
            {/* Responses */}
            <div className="responses-section-admin mb-4">
              <h3>Response</h3>
              {reportDetails.responses && reportDetails.responses.length > 0 ? (
                <div className="responses-thread-admin">
                  {reportDetails.responses.map((resp) => (
                    <div key={resp.id} className="response-item-admin">
                      <div className="response-header-admin">
                        <strong>
                          {resp.user_id === reportDetails.reporter_id
                            ? `${reportDetails.reporter?.first_name} ${reportDetails.reporter?.last_name}`
                            : resp.user_id === reportDetails.reported_id
                            ? `${reportDetails.reported?.first_name} ${reportDetails.reported?.last_name}`
                            : resp.user
                            ? `${resp.user.first_name} ${resp.user.last_name}`
                            : "Unknown Responder"}
                        </strong>
                        <small>{formatDate(resp.createdAt)}</small>
                      </div>
                      <div className="response-body-admin">
                        <div className="response-text-admin">
                          {resp.response_text}
                        </div>
                        {resp.evidence && resp.evidence.length > 0 && (
                          <div className="response-evidence-admin mt-2">
                            {" "}
                            <h6 className="small mb-2">Evidence Provided:</h6>
                            <Row className="g-2">
                              {resp.evidence.map((ev) =>
                                renderEvidenceItem(
                                  ev,
                                  resp.user
                                    ? `${resp.user.first_name} ${resp.user.last_name}`
                                    : "Responder"
                                )
                              )}
                            </Row>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-responses-admin">
                  No responses submitted yet.
                </p>
              )}
            </div>

            {/* Admin Resolution Info */}
            {(reportDetails.status === "admin_resolved" ||
              reportDetails.status === "admin_dismissed") && (
              <div className="admin-resolution-section-admin response-item-admin mb-4">
                <h3>Admin Resolution</h3>
                <div className="detail-item-admin">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-admin ${getStatusClass(
                      reportDetails.status
                    )}`}
                  >
                    {reportDetails.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="detail-item-admin">
                  <strong>Action Taken:</strong>{" "}
                  <Badge bg="info" className="status-admin">
                    {reportDetails.admin_action_taken?.replace(/_/g, " ") ||
                      "N/A"}
                  </Badge>
                </div>
                <div className="detail-item-admin">
                  <strong>Resolved By:</strong>{" "}
                  {reportDetails.resolvedByAdmin
                    ? `${reportDetails.resolvedByAdmin.first_name} ${reportDetails.resolvedByAdmin.last_name}`
                    : "Admin"}
                </div>
                <div className="detail-item-admin">
                  <strong>Date Resolved:</strong>{" "}
                  {formatDate(reportDetails.updatedAt)}
                </div>
                <div className="detail-item-admin mt-2">
                  <strong>Resolution Notes:</strong>
                  <div className="description-text-admin mt-1">
                    {reportDetails.admin_resolution_notes || (
                      <span className="text-muted">No notes provided</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Action Form */}
            {(reportDetails.status === "escalated" ||
              reportDetails.status === "admin_review") && (
              <div className="admin-action-section-admin mb-4 p-3">
                <h3>Action</h3>
                <Form onSubmit={handleAdminAction}>
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

                  {adminStatus === "admin_resolved" && (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Action Taken Against Reported User
                      </Form.Label>
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

                  <Button
                    variant="primary"
                    type="submit"
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
                </Form>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TransactionReportItem;
