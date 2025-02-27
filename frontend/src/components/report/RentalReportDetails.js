import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReportDetails,
  submitReportResponse,
} from "../../redux/reports/RentalReportsSlice";
import { FiPaperclip, FiSend, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import "./RentalReportDetails.css";

const RentalReportDetails = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get token from the auth context
  const { studentUser } = useAuth();
  const token = studentUser?.token;

  // Destructure reportDetails, status, and error from the slice state
  const { reportDetails, status, error } = useSelector(
    (state) => state.rentalReports
  );

  const [response, setResponse] = useState("");
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // For file upload UI
  const fileInputRef = useRef(null);
  const [fileValidationError, setFileValidationError] = useState("");

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
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    return "document";
  };

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        submitReportResponse({ reportId, responseText: response, files })
      ).unwrap();
      setSubmitSuccess(true);
      setResponse("");
      setFiles([]);
      setFileNames([]);
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

  const getStatusBadgeVariant = (statusValue) => {
    switch (statusValue?.toLowerCase()) {
      case "open":
        return "open";
      case "in progress":
        return "in_progress";
      case "resolved":
        return "resolved";
      default:
        return "secondary";
    }
  };

  // Render an evidence item from the fetched report
  const renderEvidenceItem = (evidence) => {
    // If the file path ends with common image extensions, display the image
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

  // Render selected files (for new upload) similar to ReportModal style
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

  if (status === "loading" || !reportDetails) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
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

  return (
    <div className="report-details-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft className="icon-left" />
        Back to Reports
      </button>

      <div className="report-container">
        <div className="report-header">
          <h2>Report #{reportId}</h2>
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
              {reportDetails.report_description}
            </div>
          </div>

          {reportDetails.property && (
            <div className="property-section">
              <h3>Property Information</h3>
              <div className="property-card">
                <p>
                  <strong>Address:</strong> {reportDetails.property.address}
                </p>
                <p>
                  <strong>Unit:</strong> {reportDetails.property.unit}
                </p>
                <p>
                  <strong>Property ID:</strong> {reportDetails.property.id}
                </p>
              </div>
            </div>
          )}

          <div className="evidence-section">
            <h3>Evidence Provided</h3>
            {reportDetails.evidence?.length > 0 ? (
              <div className="evidence-grid">
                {reportDetails.evidence.map((evidence) =>
                  renderEvidenceItem(evidence)
                )}
              </div>
            ) : (
              <p className="no-evidence">No evidence files provided</p>
            )}
          </div>

          <div className="response-section">
            <h3>Submit Response</h3>
            {submitSuccess && (
              <div className="success-alert">
                Response submitted successfully!
              </div>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Your Response</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your detailed response here..."
                  disabled={isSubmitting}
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
                    <i className="bi bi-upload me-1"></i> Upload Proofs
                  </Button>
                  <Form.Text className="text-muted">
                    Images, videos, or documents up to 10MB each
                  </Form.Text>
                </div>
                {fileValidationError && (
                  <Alert variant="danger" className="mt-2 py-1 px-2">
                    {fileValidationError}
                  </Alert>
                )}
              </Form.Group>

              {files.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 fw-bold">Uploaded proofs:</p>
                  <ul className="list-group">
                    {files.map((file, index) =>
                      renderSelectedFileItem(file, index)
                    )}
                  </ul>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!response.trim() || isSubmitting}
                className="d-flex align-items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="btn-spinner"></div>
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
        </div>
      </div>
    </div>
  );
};

export default RentalReportDetails;
