import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const OrgFormModal = ({
  show,
  onClose,
  onSubmit,
  editableOrg,
  setEditableOrg,
  categories,
  mode = "add", // "add" or "edit"
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditableOrg((prev) => ({
      ...prev,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "edit" ? "Edit Organization" : "Add Organization"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="orgName">
            <Form.Label>Organization Name</Form.Label>
            <Form.Control
              type="text"
              name="org_name"
              value={editableOrg.org_name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="description" className="mt-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={editableOrg.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="category" className="mt-2">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={editableOrg.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="isActive" className="mt-2">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="isActive"
              value={editableOrg.isActive}
              onChange={handleChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {mode === "edit" ? "Update" : "Add"} Organization
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrgFormModal;
