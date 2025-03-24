import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReportDetails,
  submitReportResponse,
  resolveReport,
  escalateReport,
} from "../../redux/reports/RentalReportsSlice";
import { FiPaperclip, FiSend, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import "./RentalReportDetails.css";

const RentalReportDetails = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get token and user info from auth context
  const { studentUser } = useAuth();
  const token = studentUser?.token;
  const currentUserId = studentUser?.userId;

  // Get reportDetails, status, and error from redux state
  const { reportDetails, status, error } = useSelector(
    (state) => state.rentalReports
  );

  // Local state for new response submission
  const [response, setResponse] = useState("");
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // For file upload UI
  const fileInputRef = useRef(null);
  const [fileValidationError, setFileValidationError] = useState("");

  // Determine user roles for this report:
  // Reporter: the user who filed the report.
  // Reportee: the user against whom the report was filed.
  const isReporter =
    reportDetails && currentUserId === reportDetails.reporter_id;
  const isReportee =
    reportDetails && currentUserId === reportDetails.reported_id;

  useEffect(() => {
    if (token) {
      dispatch(fetchReportDetails({ reportId, token }));
    }
  }, [dispatch, reportId, token]);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    // Validate files
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    for (let file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setFileValidationError("Only images, PDFs, and MP4 videos are allowed");
        return;
      }
      if (file.size > maxFileSize) {
        setFileValidationError("Files must be less than 10MB");
        return;
      }
    }
    setFileValidationError("");
    setFiles(selectedFiles);
    setFileNames(selectedFiles.map((file) => file.name));
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Utility to return file type (used in Badge)
  const getFileTypeEnum = (fileType) => {
    if (fileType.startsWith("image/")) return "Image";
    if (fileType.startsWith("video/")) return "Video";
    return "Document";
  };

  // Render an evidence item (for both report and responses)
  const renderEvidenceItem = (evidence) => {
    const isImage = evidence.file_path.match(/\.(jpeg|jpg|gif|png)$/i);
    return (
      <div key={evidence.id} className="evidence-item">
        <div className="evidence-card">
          {isImage ? (
            <img
              src={evidence.file_path}
              alt="Evidence"
              className="evidence-img"
            />
          ) : (
            <div className="file-preview-document">
              <FiPaperclip className="file-icon" />
              <a
                href={evidence.file_path}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Evidence
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render selected file item for new upload
  const renderSelectedFileItem = (file, index) => {
    return (
      <li
        key={index}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <Badge bg="secondary" className="me-2">
            {getFileTypeEnum(file.type)}
          </Badge>
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => removeFile(index)}
        >
          <i className="bi bi-x"></i>
        </Button>
      </li>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        submitReportResponse({ reportId, responseText: response, files, token })
      ).unwrap();
      setSubmitSuccess(true);
      setResponse("");
      setFiles([]);
      setFileNames([]);
      // Refresh report details to include the new response
      if (token) {
        dispatch(fetchReportDetails({ reportId, token }));
      }
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to submit response:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reporter actions: resolve or escalate report
  const handleResolve = async () => {
    try {
      await dispatch(resolveReport({ reportId, token })).unwrap();
      // Refresh report details to show updated status
      dispatch(fetchReportDetails({ reportId, token }));
    } catch (err) {
      console.error("Failed to mark as resolved:", err);
    }
  };

  const handleEscalate = async () => {
    try {
      await dispatch(escalateReport({ reportId, token })).unwrap();
      // Refresh report details to show updated status
      dispatch(fetchReportDetails({ reportId, token }));
    } catch (err) {
      console.error("Failed to escalate report:", err);
    }
  };

  const getStatusBadgeVariant = (statusValue) => {
    switch (statusValue?.toLowerCase()) {
      case "open":
        return "open";
      case "under_review":
        return "in_progress";
      case "resolved":
        return "resolved";
      case "escalated":
        return "escalated";
      default:
        return "secondary";
    }
  };

  if (status === "loading" || !reportDetails) {
    return (
      <div className="loading-container">
        <Spinner animation="border" />
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Report</Alert.Heading>
        <p>{error?.error || error?.message || "An error occurred"}</p>
        <Button variant="outline-danger" onClick={() => navigate(-1)}>
          <FiArrowLeft className="icon-left" />
          Go Back
        </Button>
      </Alert>
    );
  }

  // Calculate top-level evidence once we know reportDetails exists.
  const topLevelEvidence = (reportDetails.evidence || []).filter(
    (item) =>
      !item.rental_report_response_id &&
      item.uploaded_by_id === reportDetails.reporter_id
  );

  return (
    <div className="report-details-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft className="icon-left" />
        Back to Reports
      </button>

      <div className="report-container">
        <div className="report-header">
          <h2>
            Report Case for:{" "}
            {reportDetails.rentalTransaction?.Listing?.listing_name ||
              reportDetails.rentalTransaction?.ItemForSale?.item_for_sale_name}
          </h2>
          <span
            className={`status status-${getStatusBadgeVariant(
              reportDetails.status
            )}`}
          >
            {reportDetails.status}
          </span>
        </div>

        <div className="report-content">
          <div className="description-section">
            <h3>Description</h3>
            <div className="description-text">
              <strong>
                {reportDetails.reporter?.first_name}{" "}
                {reportDetails.reporter?.last_name}:
              </strong>{" "}
              {reportDetails.report_description}
            </div>
          </div>

          <div className="evidence-section">
            <h3>Evidence Provided</h3>
            {topLevelEvidence.length > 0 ? (
              <div className="evidence-grid">
                {topLevelEvidence.map((evidence) =>
                  renderEvidenceItem(evidence)
                )}
              </div>
            ) : (
              <p className="no-evidence">No evidence files provided</p>
            )}
          </div>

          {/* Threaded Responses Section */}
          <div className="responses-section">
            <h3>Responses</h3>
            {(reportDetails.responses || []).length > 0 ? (
              <div className="responses-thread">
                {(reportDetails.responses || []).map((resp) => (
                  <div key={resp.id} className="response-item">
                    <div className="response-header">
                      <strong>
                        {resp.user_id === reportDetails.reporter_id
                          ? `${reportDetails.reporter.first_name} ${reportDetails.reporter.last_name}`
                          : `${reportDetails.reported.first_name} ${reportDetails.reported.last_name}`}
                      </strong>{" "}
                      <small>{new Date(resp.createdAt).toLocaleString()}</small>
                    </div>
                    <div className="response-text">{resp.response_text}</div>
                    {(resp.evidence || []).length > 0 && (
                      <div className="response-evidence">
                        {(resp.evidence || [])
                          .filter(
                            (file) =>
                              file.uploaded_by_id === reportDetails.reported_id
                          )
                          .map((file) => renderEvidenceItem(file))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-responses">No responses yet.</p>
            )}
          </div>

          {/* Conditional UI based on user role */}
          {isReportee &&
            reportDetails.status !== "resolved" &&
            reportDetails.status !== "escalated" && (
              <div className="response-form-section">
                <h3>Submit Your Response</h3>
                {submitSuccess && (
                  <Alert variant="success">
                    Response submitted successfully!
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Response</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Enter your response here..."
                      disabled={isSubmitting}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Upload Evidence</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*,video/mp4,application/pdf"
                        className="d-none"
                        ref={fileInputRef}
                      />
                      <Button
                        variant="outline-primary"
                        onClick={handleUploadClick}
                        className="me-2"
                      >
                        <FiPaperclip className="me-1" /> Attach Files
                      </Button>
                      <Form.Text className="text-muted">
                        Images, PDFs, or videos (max 10MB each)
                      </Form.Text>
                    </div>
                    {fileValidationError && (
                      <Alert variant="danger" className="mt-2">
                        {fileValidationError}
                      </Alert>
                    )}
                  </Form.Group>

                  {files.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1 fw-bold">Uploaded files:</p>
                      <ul className="list-group">
                        {files.map((file, index) =>
                          renderSelectedFileItem(file, index)
                        )}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!response.trim() || isSubmitting}
                    className="d-flex align-items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiSend className="me-2" />
                        Submit Response
                      </>
                    )}
                  </Button>
                </Form>
              </div>
            )}

          {isReporter && reportDetails.status !== "resolved" && (
            <>
              {reportDetails.status === "escalated" ? (
                <Alert
                  variant="info"
                  className="mt-3"
                  style={{ maxWidth: "560px" }}
                >
                  Your report has been submitted for admin review. We'll keep
                  you posted.
                </Alert>
              ) : (
                <div className="reporter-actions mt-3">
                  <h4>Actions</h4>
                  <Button
                    variant="success"
                    className="me-2"
                    onClick={handleResolve}
                  >
                    Mark as Resolved
                  </Button>
                  <Button variant="danger" onClick={handleEscalate}>
                    Escalate to Admin
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalReportDetails;
