import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ReportModal = ({ show, handleClose, handleSubmit }) => {
  const [reason, setReason] = useState("");

  const onSubmit = () => {
    if (reason.trim()) {
      handleSubmit(reason); // Pass the reason back to the parent component
      setReason(""); // Reset the form
    } else {
      alert("Please provide a reason for the report.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Submit Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Reason for Report</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for reporting."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;
