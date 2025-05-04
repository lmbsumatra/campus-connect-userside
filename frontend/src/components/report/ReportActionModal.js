import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ShowAlert from "../../utils/ShowAlert";
import { useDispatch } from "react-redux";

const ReportActionModal = ({
  show,
  onHide,
  onConfirm,
  currentStatus,
  entityType,
}) => {
  const [selectedReportStatus, setSelectedReportStatus] = useState(
    currentStatus || "pending"
  );
  const [entityAction, setEntityAction] = useState(""); // Action on entity
  const [statusMessage, setStatusMessage] = useState("");
  const dispatch = useDispatch();

  const handleConfirm = () => {
    if (selectedReportStatus === "resolved") {
      if (
        entityType === "user" &&
        (!entityAction || entityAction.trim() === "")
      ) {
        ShowAlert(
          dispatch,
          "warning",
          "Action Required",
          "Please select an action for the user (flagged or banned)."
        );
        return;
      }

      if (!statusMessage.trim()) {
        ShowAlert(
          dispatch,
          "warning",
          "Action Required",
          "Please provide a reason for this action."
        );
        return;
      }

      // Additional check for entityAction when entityType is not "user"
      if (
        entityType !== "user" &&
        (!entityAction || entityAction.trim() === "")
      ) {
        ShowAlert(
          dispatch,
          "warning",
          "Action Required",
          "Please select an action for the entity."
        );
        return;
      }
    }

    onConfirm(selectedReportStatus, entityAction, statusMessage);
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
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </Form.Control>
          </Form.Group>

          {/* Show flagged/banned options only when the report is resolved */}
          {selectedReportStatus === "resolved" && (
            <Form.Group>
              <Form.Label>
                {entityType === "user" ? "User Action" : "Entity Action"}
              </Form.Label>
              <Form.Control
                as="select"
                value={entityAction}
                onChange={(e) => setEntityAction(e.target.value)}
              >
                <option value="">Select Action</option>
                <option value="flagged">Flagged</option>
                {entityType === "user" && (
                  <option value="banned">Banned</option>
                )}
              </Form.Control>
              <Form.Label>Status Reason/Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="Provide a reason for this action..."
              />
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
