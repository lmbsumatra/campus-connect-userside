import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ShowAlert from "../../utils/ShowAlert";
import { useDispatch } from "react-redux";

const ReportActionModal = ({ show, onHide, onConfirm, currentStatus, entityType }) => {
  const [selectedReportStatus, setSelectedReportStatus] = useState(currentStatus || "pending");
  const [entityAction, setEntityAction] = useState(""); // Action on entity
  const dispatch = useDispatch();

  const handleConfirm = () => {
    if (selectedReportStatus === "reviewed" && entityType === "user" && !entityAction) {
      alert("Please select an action for the user (flagged or banned).");
      return;
    }
  
    onConfirm(selectedReportStatus, entityAction);
    ShowAlert(dispatch, "success", "Report Status", "Report status changed successfully.");
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Actions for Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Report Status Selection */}
          <Form.Group>
            <Form.Label>Report Status</Form.Label>
            <Form.Control
              as="select"
              value={selectedReportStatus}
              onChange={(e) => setSelectedReportStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
            </Form.Control>
          </Form.Group>

          {/* Show flagged/banned options only when the report is reviewed */}
          {selectedReportStatus === "reviewed" && (
            <Form.Group>
              <Form.Label>{entityType === "user" ? "User Action" : "Entity Action"}</Form.Label>
              <Form.Control
                as="select"
                value={entityAction}
                onChange={(e) => setEntityAction(e.target.value)}
              >
                <option value="">Select Action</option>
                <option value="flagged">Flagged</option>
                {entityType === "user" && <option value="banned">Banned</option>}
              </Form.Control>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportActionModal;
