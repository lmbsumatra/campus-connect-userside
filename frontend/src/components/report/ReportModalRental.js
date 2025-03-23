import React, { useState, useRef } from "react";
import { Modal, Button, Form, Badge, Alert } from "react-bootstrap";
import axios from "axios";
import { useDispatch } from "react-redux";
import ShowAlert from "../../utils/ShowAlert";
import { useAuth } from "../../context/AuthContext";
import { baseApi } from "../../utils/consonants";

const ReportModal = ({
  show,
  handleClose,
  entityType,
  entityId,
  transactionType,
  reportId = null,
}) => {
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState([]);
  const [isDispute, setIsDispute] = useState(false);
  const [fileValidationError, setFileValidationError] = useState("");
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const { studentUser } = useAuth();
  const token = studentUser?.token;

  // Reset form on modal close
  const handleModalClose = () => {
    setReason("");
    setFiles([]);
    setIsDispute(false);
    setFileValidationError("");
    handleClose();
  };

  const validateFiles = (fileList) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (let file of fileList) {
      if (!allowedTypes.includes(file.type)) {
        setFileValidationError(
          "Only images, PDFs, and MP4 videos are allowed."
        );
        return false;
      }
      if (file.size > maxFileSize) {
        setFileValidationError("Files must be less than 10MB.");
        return false;
      }
    }
    setFileValidationError("");
    return true;
  };

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    if (validateFiles(fileList)) {
      setFiles(fileList);
    } else {
      e.target.value = null;
      setFiles([]);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async () => {
    if (!reason.trim()) {
      await ShowAlert(
        dispatch,
        "warning",
        "Missing Reason",
        "Please provide a reason for the report."
      );
      return;
    }

    // Build FormData for file upload
    const formData = new FormData();
    formData.append("reason", reason);

    // Add transaction type to form data
    if (!reportId) {
      formData.append(
        "transaction_type",
        entityType === "rental_transaction" ? "rental" : "buy_sell"
      );
      formData.append("transaction_id", entityId);
    }

    files.forEach((file) => {
      formData.append("evidence", file);
    });

    const endpoint = reportId
      ? `/api/transaction-reports/${reportId}/response`
      : "/api/transaction-reports";

    try {
      await axios.post(`${baseApi}${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Show success alert
      ShowAlert(
        dispatch,
        "success",
        "Success",
        "Report submitted successfully!"
      );

      // ✅ Close modal after submission
      handleModalClose();
    } catch (error) {
      console.error("Submission failed:", error);
      ShowAlert(
        dispatch,
        "error",
        "Submission Error",
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const getEntityTypeLabel = () => {
    switch (entityType) {
      case "user":
        return "User";
      case "listing":
        return "Listing";
      case "post":
        return "Post";
      case "rental_transaction":
        return "Rental Transaction";
      case "sale_transaction":
        return "Sale Transaction";
      default:
        return "Item";
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {reportId ? "Respond to Report" : `Report ${getEntityTypeLabel()}`}
          {isDispute && (
            <Badge className="ms-2" bg="warning">
              Dispute
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">
          {reportId
            ? "Provide your response with detailed information and evidence."
            : `Please provide detailed information about why you're reporting this ${getEntityTypeLabel().toLowerCase()}.`}
        </p>

        <Form.Group className="mb-3">
          <Form.Label>
            Reason for Report <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Evidence (optional)</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,video/mp4,application/pdf"
              ref={fileInputRef}
              className="d-none"
            />
            <Button
              variant="outline-primary"
              onClick={() => fileInputRef.current.click()}
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
          <ul className="list-group mb-3">
            {files.map((file, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <Badge bg="secondary" className="me-2">
                  {file.type.startsWith("image/")
                    ? "Image"
                    : file.type.startsWith("video/")
                    ? "Video"
                    : "Document"}
                </Badge>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <i className="bi bi-x"></i>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleModalClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onSubmit}>
          {reportId ? "Submit Response" : "Submit Report"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;
