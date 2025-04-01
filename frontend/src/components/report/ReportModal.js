import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import ShowAlert from "../../utils/ShowAlert";

const ReportModal = ({ show, handleClose, handleSubmit, entityType }) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const dispatch = useDispatch();

  const predefinedReasons = {
    user: [
      "Inappropriate Profile",
      "Fake Profile",
      "Harassment",
      "Spamming",
      "Impersonation",
    ],
    listing: [
      "Misleading Listing",
      "Unrealistic Pricing",
      "No Longer Available",
      "Inappropriate Content",
      "Violates Policies",
    ],
    post: [
      "Offensive Content",
      "Spam",
      "Harassment",
      "Misleading Information",
      "Violates Platform Policies",
    ],
    sale: [
      "Scam/Fraud",
      "Incorrect Payment Information",
      "Item Not Delivered",
      "False Advertising",
      "Violation of Terms",
    ],
    other: ["Other"], // Allow for custom reasons
  };

  // Ensure we are getting a valid array for filteredReasons
  const filteredReasons = predefinedReasons[entityType] || [];

  useEffect(() => {
    // Reset reason and custom reason when the modal is opened
    setReason("");
    setCustomReason("");
  }, [show]); // Runs every time the modal opens

  const onSubmit = async () => {
    const finalReason = reason === "Other" ? customReason.trim() : reason;

    if (finalReason) {
      handleSubmit(finalReason); // Pass the reason back to the parent component
      setReason(""); // Reset reason and customReason for next time
      setCustomReason("");
    } else {
      await ShowAlert(
        dispatch,
        "warning",
        "Missing Reason",
        "Please provide a reason for the report."
      );
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Submit Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Select Reason for Report</Form.Label>
          <Form.Control
            as="select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">-- Select a reason --</option>
            {filteredReasons.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
            <option value="Other">Other</option> {/* Always show "Other" */}
          </Form.Control>
        </Form.Group>

        {reason === "Other" && (
          <Form.Group className="mt-3">
            <Form.Label>Provide a Custom Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter the reason for reporting."
            />
          </Form.Group>
        )}
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
