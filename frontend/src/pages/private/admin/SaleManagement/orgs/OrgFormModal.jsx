import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Image } from "react-bootstrap";
import RepSelector from "./RepSelector";
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
  showRepList,
  setShowRepList,
  repListRefs,
  searchInputRefs,
  displayAlert,
  focusHandledRef,
}) => {
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [repName, setRepName] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (editableOrg.rep_id) {
      const rep = users.find((user) => user.user_id === editableOrg.rep_id);
      if (rep) {
        setRepName(`${rep.first_name} ${rep.last_name}`);
      } else {
        setRepName("None");
      }
    } else {
      setRepName("None");
    }

    // Set logo preview if org has existing logo
    if (editableOrg.logo_url) {
      setLogoPreview(editableOrg.logo_url);
    } else {
      setLogoPreview(null);
    }
  }, [editableOrg.rep_id, editableOrg.logo_url, users]);

  const validateForm = () => {
    const errors = {};

    // Check organization name
    if (!editableOrg.org_name || !editableOrg.org_name.trim()) {
      errors.org_name = "Organization name is required";
    }

    // Check category
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

    // Clear specific error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  // Function to trigger the file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
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

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      displayAlert("Image size should be less than 2MB", "danger");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Update form state
    setEditableOrg((prev) => ({
      ...prev,
      logo_file: file,
      logo_name: file.name,
      remove_logo: false, // Reset remove flag if it was set
    }));
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setEditableOrg((prev) => ({
      ...prev,
      logo_file: null,
      logo_name: null,
      logo_url: null,
      remove_logo: true, // Add flag to indicate logo should be removed
    }));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Custom validation
    if (!validateForm()) {
      // Show validation errors
      setValidated(true);

      // Display first error message
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
    onClose();
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
                    style={{ maxHeight: "150px", maxWidth: "300px" }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0"
                    onClick={removeLogo}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center border rounded p-5 mb-3 w-100 cursor-pointer"
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
                  className="d-none" // Hide the actual file input
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
            <div>
              <RepSelector
                orgId={editableOrg.org_id || "temp_new_org"}
                currentRepId={editableOrg.rep_id}
                users={users.filter(
                  (user) =>
                    !organizations.some(
                      (o) =>
                        (o.representative?.id || o.rep_id) === user.user_id &&
                        (o.orgId || o.org_id) !== editableOrg.org_id
                    )
                )}
                repListRefs={repListRefs}
                showRepList={showRepList}
                searchInputRefs={searchInputRefs}
                setShowRepList={setShowRepList}
                displayAlert={displayAlert}
                organizations={organizations}
                focusHandledRef={focusHandledRef}
              />
            </div>
          </Form.Group>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await dispatch(deleteOrganization(editableOrg.org_id)).unwrap();
                handleClose();
              } catch (err) {
                console.error("Failed to delete organization:", err);
              }
            }}
          >
            Delete
          </Button>
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
