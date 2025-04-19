import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Image,
  ListGroup,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { deleteOrganization } from "../../../../../redux/orgs/organizationsSlice";
import { useDispatch } from "react-redux";

const OrgFormModal = ({
  show,
  onClose,
  onSubmit,
  editableOrg,
  setEditableOrg,
  mode,
  categories,
  users,
  organizations,
  displayAlert,
}) => {
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [showRepList, setShowRepList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);
  const repListRef = useRef(null);
  const searchInputRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (editableOrg.logo) {
      setLogoPreview(editableOrg.logo);
    } else {
      setLogoPreview(null);
    }
  }, [editableOrg.logo]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showRepList &&
        repListRef.current &&
        !repListRef.current.contains(event.target) &&
        (!searchInputRef.current ||
          !searchInputRef.current.contains(event.target))
      ) {
        setShowRepList(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRepList]);

  const validateForm = () => {
    const errors = {};

    if (!editableOrg.org_name || !editableOrg.org_name.trim()) {
      errors.org_name = "Organization name is required";
    }

    if (!editableOrg.category || !editableOrg.category.trim()) {
      errors.category = "Category is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableOrg((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      displayAlert(
        "Please select a valid image file (JPEG, PNG, GIF, SVG)",
        "danger"
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      displayAlert("Image size should be less than 2MB", "danger");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setEditableOrg((prev) => ({
      ...prev,
      logo_file: file,
      logo_name: file.name,
      remove_logo: false,
      logo: null,
    }));
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setEditableOrg((prev) => ({
      ...prev,
      remove_logo: true,
      logo_file: null,
      logo_name: null,
      logo: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setValidated(true);

      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        displayAlert(firstError, "danger");
      }
      return;
    }

    setValidated(true);
    onSubmit();
  };

  const handleClose = () => {
    setValidated(false);
    setFormErrors({});
    setSearchTerm("");
    setShowRepList(false);
    onClose();
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteOrganization(editableOrg.org_id)).unwrap();
      displayAlert(
        `Organization "${editableOrg.org_name}" deleted successfully`,
        "success"
      );
      handleClose();
    } catch (err) {
      console.error("Failed to delete organization:", err);
      displayAlert(`Failed to delete organization: ${err.message}`, "danger");
    }
  };

  const getAvailableUsers = () => {
    return users.filter(
      (user) =>
        !organizations.some(
          (o) =>
            (o.representative?.id || o.rep_id) === user.user_id &&
            (o.orgId || o.org_id) !== editableOrg.org_id
        )
    );
  };

  const filteredUsers = getAvailableUsers().filter((user) => {
    const userNameLower = `${user.first_name || ""} ${
      user.last_name || ""
    }`.toLowerCase();
    const userIdString = String(user.user_id || "");
    return (
      userNameLower.includes(searchTerm.toLowerCase()) ||
      userIdString.includes(searchTerm)
    );
  });

  const getCurrentRep = () => {
    if (!editableOrg.rep_id) return null;
    return users.find((user) => user.user_id === editableOrg.rep_id);
  };

  const currentRep = getCurrentRep();

  const handleSetRep = (userId) => {
    setEditableOrg((prev) => ({
      ...prev,
      rep_id: userId,
    }));
    setShowRepList(false);
    setSearchTerm("");
    editableOrg.rep_id = userId;
  };

  const handleRemoveRep = () => {
    setEditableOrg((prev) => ({
      ...prev,
      rep_id: null,
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "add" ? "Add" : "Edit"} Organization
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Logo Upload Container */}
          <Form.Group className="mb-4">
            <Form.Label>Organization Logo</Form.Label>
            <div className="d-flex flex-column align-items-center mb-3">
              {logoPreview ? (
                <div className="position-relative mb-3">
                  <Image
                    src={logoPreview}
                    alt="Organization Logo Preview"
                    thumbnail
                    style={{ height: "100px", width: "100px" }}
                  />
                </div>
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center border rounded p-5 mb-3 w-100"
                  style={{
                    height: "150px",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                  }}
                  onClick={triggerFileInput}
                >
                  <div className="text-center text-muted">
                    <i className="bi bi-image" style={{ fontSize: "2rem" }}></i>
                    <p className="mb-0 mt-2">Click to upload logo</p>
                  </div>
                </div>
              )}

              <div className="d-flex gap-2 w-100">
                <Button variant="primary" size="sm" onClick={triggerFileInput}>
                  Choose Logo
                </Button>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  ref={fileInputRef}
                  className="d-none"
                />

                {logoPreview && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={removeLogo}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <Form.Text className="text-muted mt-2">
                Recommended size: 300x150px. Max file size: 2MB. Supported
                formats: JPEG, PNG, GIF, SVG
              </Form.Text>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Organization Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="org_name"
              value={editableOrg.org_name || ""}
              onChange={handleChange}
              isInvalid={!!formErrors.org_name}
              required
              placeholder="Enter organization name"
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.org_name || "Please provide an organization name."}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={editableOrg.description || ""}
              onChange={handleChange}
              placeholder="Organization description"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Category <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="category"
              value={editableOrg.category || ""}
              onChange={handleChange}
              isInvalid={!!formErrors.category}
              required
            >
              <option value="">Select a category</option>
              {categories}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.category || "Please select a category."}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="isActive"
              value={editableOrg.isActive || "active"}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Representative</Form.Label>
            <div className="position-relative">
              {currentRep ? (
                <div className="current-rep mb-2">
                  <Badge
                    bg="info"
                    className="rep-badge d-flex align-items-center gap-2 justify-content-between"
                  >
                    <span>
                      {currentRep.first_name} {currentRep.last_name}
                    </span>
                    <button
                      className="remove-rep-btn p-0 m-0"
                      onClick={handleRemoveRep}
                    >
                      ×
                    </button>
                  </Badge>
                </div>
              ) : (
                <>
                  <div className="no-rep mb-2">
                    <Badge bg="secondary">No Representative</Badge>
                  </div>
                  <InputGroup size="sm">
                    <Form.Control
                      placeholder="Search for representative"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setShowRepList(true)}
                      ref={searchInputRef}
                      aria-label="Search representatives"
                    />
                  </InputGroup>
                </>
              )}

              {showRepList && (
                <ListGroup
                  className="position-absolute w-100 shadow-sm rep-list-container"
                  ref={repListRef}
                  style={{
                    zIndex: 1000,
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <ListGroup.Item
                        key={user.user_id}
                        className="rep-list-item d-flex justify-content-between align-items-center"
                      >
                        <span className="rep-name">
                          {user.first_name} {user.last_name} (ID: {user.user_id}
                          )
                        </span>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSetRep(user.user_id);
                          }}
                        >
                          Select
                        </Button>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No users found</ListGroup.Item>
                  )}
                </ListGroup>
              )}
            </div>
          </Form.Group>

          {mode === "edit" && (
            <Button variant="danger" onClick={handleDelete} className="mt-3">
              Delete Organization
            </Button>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {mode === "add" ? "Add" : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrgFormModal;
