import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import "./ActionModal.css";

const ActionModal = ({ show, onHide, title, formLabels }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Post Approval Section */}
        <div className="border rounded p-3 mb-4">
          <div className="d-flex justify-content-between">
            <h5>Post Approval</h5>
            <span>Status: <span className="badge bg-warning ms-2">Pending</span></span>
          </div>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>{formLabels.approvalLabel}</Form.Label>
              <div className="d-flex gap-5 justify-between">
                <Form.Check type="radio" label="Approve" name="approvalOption" />
                <Form.Check type="radio" label="Deny" name="approvalOption" />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{formLabels.reasonForDenialLabel}</Form.Label>
              <Form.Control type="text" placeholder="Provide reason..." />
            </Form.Group>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button variant="btn btn-outline-dark">Clear</Button>
              <Button variant="btn btn-dark">Proceed</Button>
            </div>
          </Form>
        </div>

        {/* Post Removal Section */}
        <div className="border rounded p-3 mb-4">
          <div className="d-flex justify-content-between">
            <h5>Post Removal</h5>
            <span>Status: <span className="badge bg-success ms-2">Active</span></span>
          </div>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>{formLabels.removalLabel}</Form.Label>
              <div className="d-flex gap-5 justify-between">
                <Form.Check type="radio" label="Revoke" name="removalOption" />
                <Form.Check type="radio" label="Remove" name="removalOption" />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{formLabels.reasonForRestrictionLabel}</Form.Label>
              <Form.Control type="text" placeholder="Provide reason..." />
            </Form.Group>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button variant="btn btn-outline-dark">Clear</Button>
              <Button variant="btn btn-dark">Proceed</Button>
            </div>
          </Form>
        </div>

        {/* Flag Post Section */}
        <div className="border rounded p-3">
          <div className="d-flex justify-content-between">
            <h5>Flag Post</h5>
            <span className="text-warning text-decoration-underline">History</span>
          </div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{formLabels.actionLabel}</Form.Label>
              <Form.Control type="text" placeholder="Provide reason for flagging" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{formLabels.additionalReasonLabel}</Form.Label>
              <Form.Control type="text" placeholder="Provide additional reason..." />
            </Form.Group>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button variant="btn btn-outline-dark">Clear</Button>
              <Button variant="btn btn-dark">Proceed</Button>
            </div>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ActionModal;
