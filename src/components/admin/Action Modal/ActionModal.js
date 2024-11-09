import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ItemStatus } from "../../../utils/Status"; // Ensure this is correctly defined for your statuses
import "./ActionModal.css"

const ActionModal = ({
  show,
  onHide,
  title,
  formLabels,
  status,
  onConfirm,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [denialReason, setDenialReason] = useState("");
  const [restrictionReason, setRestrictionReason] = useState("");

  const handleProceed = () => {
    const reason = selectedStatus === "declined" ? denialReason : restrictionReason;
    onConfirm(selectedStatus, reason); // Pass the selected status and reason
    onHide(); // Close the modal
  };

  const { label, className } = ItemStatus(status); // Ensure ListingStatus handles the new statuses

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          Status: <span className={`badge ${className} ms-2`}>{label}</span>
        </span>
        
        {/* Post Approval Section */}
        <div className="border rounded p-3 mb-4">
          <h5>Post Approval</h5>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>{formLabels.approvalLabel}</Form.Label>
              <div className="d-flex gap-5 justify-between">
                <Form.Check
                  type="radio"
                  label="Approve"
                  name="status"
                  value="approved"
                  onChange={() => setSelectedStatus("approved")}
                />
                <Form.Check
                  type="radio"
                  label="Deny"
                  name="status"
                  value="declined"
                  onChange={() => setSelectedStatus("declined")}
                />
              </div>
            </Form.Group>
            {selectedStatus === "declined" && (
              <Form.Group className="mb-3">
                <Form.Label>{formLabels.reasonForDenialLabel}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Provide reason..."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </div>

        {/* Post Removal Section */}
        <div className="border rounded p-3 mb-4">
          <h5>Post Removal</h5>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>{formLabels.removalLabel}</Form.Label>
              <div className="d-flex gap-5 justify-between">
                <Form.Check
                  type="radio"
                  label="Revoke"
                  name="status"
                  value="revoked"
                  onChange={() => setSelectedStatus("revoked")}
                />
                <Form.Check
                  type="radio"
                  label="Remove"
                  name="status"
                  value="removed"
                  onChange={() => setSelectedStatus("removed")}
                />
              </div>
            </Form.Group>
            {(selectedStatus === "removed" || selectedStatus === "revoked") && (
              <Form.Group className="mb-3">
                <Form.Label>{formLabels.reasonForRestrictionLabel}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Provide reason..."
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </div>

        {/* Flag Post Section */}
        <div className="border rounded p-3">
          <h5>Flag Post</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{formLabels.actionLabel}</Form.Label>
              <Form.Control
                type="text"
                placeholder="Provide reason for flagging"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{formLabels.additionalReasonLabel}</Form.Label>
              <Form.Control
                type="text"
                placeholder="Provide additional reason..."
              />
            </Form.Group>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button variant="btn btn-outline-dark">Clear</Button>
              <Button variant="btn btn-dark" onClick={handleProceed}>
                Proceed
              </Button>
            </div>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ActionModal;
