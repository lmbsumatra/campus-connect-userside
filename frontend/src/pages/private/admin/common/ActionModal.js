import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ActionModal = ({ show, onHide, title, formLabels, onConfirm, status }) => {
  const [selectedAction, setSelectedAction] = useState('approved');
  const [reasonText, setReasonText] = useState('');

  const handleSubmit = () => {
    onConfirm(selectedAction, reasonText);
    setReasonText('');
  };

  // Get placeholder text based on selected action
  const getPlaceholder = () => {
    switch (selectedAction) {
      case 'approved':
        return 'Listing meets requirements';
      case 'declined':
        return 'Reason for declining the listing';
      case 'removed':
        return 'Reason for removing the listing';
      case 'revoked':
        return 'Reason for revoking approval';
      case 'flagged':
        return 'Reason for flagging the listing';
      case 'unavailable':
        return 'Reason for marking as unavailable';
      default:
        return 'Additional comments';
    }
  };

  // Get label text based on selected action
  const getActionLabel = () => {
    switch (selectedAction) {
      case 'approved':
        return formLabels.approvalLabel;
      case 'declined':
        return formLabels.reasonForDenialLabel;
      case 'removed':
        return formLabels.removalLabel;
      case 'revoked':
      case 'flagged':
        return formLabels.reasonForRestrictionLabel;
      default:
        return formLabels.additionalReasonLabel;
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{formLabels.actionLabel}</Form.Label>
            <Form.Select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="approved">Approve</option>
              <option value="declined">Decline</option>
              <option value="removed">Remove</option>
              <option value="revoked">Revoke</option>
              <option value="flagged">Flag</option>
              <option value="unavailable">Mark Unavailable</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{getActionLabel()}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={getPlaceholder()}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          className={`btn-${selectedAction === 'approved' ? 'success' : 
                      selectedAction === 'declined' || selectedAction === 'removed' ? 'danger' : 
                      selectedAction === 'flagged' ? 'warning' : 'primary'}`}
        >
          Confirm {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActionModal;