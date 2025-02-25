import React, { useState, useRef } from "react";
import { Modal, Button, Form, Badge, Alert } from "react-bootstrap";
import { useDispatch } from "react-redux";
import ShowAlert from "../../utils/ShowAlert";

const ReportModal = ({
  show,
  handleClose,
  handleSubmit,
  entityType,
  entityId,
  currentUserId,
}) => {
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState([]);
  const [isDispute, setIsDispute] = useState(false);
  const [fileValidationError, setFileValidationError] = useState("");
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  // Reset form on close
  const handleModalClose = () => {
    setReason("");
    setFiles([]);
    setIsDispute(false);
    setFileValidationError("");
    handleClose();
  };

  const validateFiles = (fileList) => {
    // Check file types and sizes
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (!allowedTypes.includes(file.type)) {
        setFileValidationError("Only images, PDFs, and MP4 videos are allowed");
        return false;
      }

      if (file.size > maxFileSize) {
        setFileValidationError("Files must be less than 10MB");
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
      // Clear invalid files
      e.target.value = null;
      setFiles([]);
    }
  };

  // Trigger the hidden file input when the upload button is clicked
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    // Reset the file input if all files are removed
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileTypeEnum = (fileType) => {
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    return "document";
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

    // Prepare the report data structure
    const reportData = {
      reporter_id: currentUserId,
      reported_entity_id: entityId,
      entity_type: entityType,
      reason: reason,
      is_dispute: isDispute,
      // The status will be set to "pending" by default on the server

      // Prepare file evidence data
      evidence: files.map((file) => ({
        file: file,
        file_type: getFileTypeEnum(file.type),
        uploaded_by: currentUserId,
      })),
    };

    handleSubmit(reportData);
    handleModalClose();
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
          Report {getEntityTypeLabel()}
          {isDispute && (
            <Badge className="ms-2" bg="warning">
              Dispute
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">
          Please provide detailed information about why you're reporting this{" "}
          {getEntityTypeLabel().toLowerCase()}.
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
            placeholder="Describe the issue in detail"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Evidence (optional)</Form.Label>
          <div className="d-flex align-items-center">
            {/* Hidden file input */}
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,video/mp4,application/pdf"
              className="d-none"
              ref={fileInputRef}
            />

            {/* Visible upload button */}
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
              {files.map((file, index) => (
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
              ))}
            </ul>
          </div>
        )}

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            id="dispute-checkbox"
            label="Mark as Dispute (check this if you're reporting an issue with a transaction)"
            checked={isDispute}
            onChange={(e) => setIsDispute(e.target.checked)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleModalClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onSubmit}>
          Submit Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;
