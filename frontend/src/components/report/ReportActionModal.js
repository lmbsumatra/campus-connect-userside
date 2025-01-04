import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ReportActionModal = ({ show, onHide, onConfirm, currentStatus }) => {
  const [selectedAction, setSelectedAction] = useState(currentStatus || "pending");

  const handleConfirm = () => {
    onConfirm(selectedAction);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Actions for Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Action</Form.Label>
            <Form.Control
              as="select"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="flagged">Flagged</option>
              <option value="dismissed">Dismissed</option>
            </Form.Control>
          </Form.Group>
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
