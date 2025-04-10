import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Modal,
  Form,
  Table,
  ListGroup,
  InputGroup,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import "./OrgsManagement.css";

import {
  fetchOrganizations,
  fetchCategories,
  fetchUsers,
  addOrganization,
  updateOrganization,
  toggleOrgStatus,
  setOrgRepresentative,
  setCurrentOrg,
  clearCurrentOrg,
  updateSearchRepMap,
  clearError,
  selectOrganizations,
  selectCategories,
  selectUsers,
  selectLoading,
  selectError,
  selectCurrentOrg,
  selectSearchRepMap,
} from "../../../../redux/orgs/organizationsSlice";

const OrgsManagement = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const organizations = useSelector(selectOrganizations);
  const categoriesFromRedux = useSelector(selectCategories);
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const currentOrgFromRedux = useSelector(selectCurrentOrg);
  const searchRepMapFromRedux = useSelector(selectSearchRepMap);

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRepList, setShowRepList] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [editableOrg, setEditableOrg] = useState({
    org_name: "",
    description: "",
    category: "",
    isActive: "active",
    rep_id: null,
  });

  // Refs for handling clicks outside of components
  const repListRefs = useRef({});
  const searchInputRefs = useRef({});

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchCategories());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Clear any errors when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearCurrentOrg());
    };
  }, [dispatch]);

  // Handle errors from Redux
  useEffect(() => {
    if (error) {
      setAlertMessage(error);
      setShowAlert(true);
    }
  }, [error]);

  // Function to handle clicks outside of the rep list
  useEffect(() => {
    function handleClickOutside(event) {
      for (const orgId in showRepList) {
        if (
          showRepList[orgId] &&
          repListRefs.current[orgId] &&
          !repListRefs.current[orgId].contains(event.target) &&
          (!searchInputRefs.current[orgId] ||
            !searchInputRefs.current[orgId].contains(event.target))
        ) {
          setShowRepList((prev) => ({ ...prev, [orgId]: false }));
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRepList]);

  // Process categories from Redux
  const processCategories = () => {
    if (!categoriesFromRedux || !Array.isArray(categoriesFromRedux)) {
      return ["all"];
    }

    if (
      categoriesFromRedux.length > 0 &&
      typeof categoriesFromRedux[0] === "object"
    ) {
      return [
        "all",
        ...categoriesFromRedux.map((cat) =>
          typeof cat.name === "string"
            ? cat.name
            : typeof cat.category === "string"
            ? cat.category
            : JSON.stringify(cat)
        ),
      ];
    }

    return ["all", ...categoriesFromRedux];
  };

  // Get unique categories from organizations as fallback
  const getCategoriesFromOrgs = () => {
    const uniqueCategories = [
      ...new Set(organizations.map((org) => org.category)),
    ];
    return ["all", ...uniqueCategories.sort()];
  };

  // Get categories for rendering
  const getCategories = () => {
    const processedCategories = processCategories();
    return processedCategories.length > 1
      ? processedCategories
      : getCategoriesFromOrgs();
  };

  // Filter organizations by category
  const getFilteredOrgs = () => {
    if (activeCategory === "all") {
      return organizations;
    }
    return organizations.filter((org) => org.category.name === activeCategory);
  };

  const getUserById = (userId) => {
    if (!userId) return null;
    return users.find((user) => user.user_id === userId);
  };

  const getFilteredUsers = (orgId) => {
    const searchTerm = searchRepMapFromRedux[orgId] || "";
    return users.filter((user) => {
      const userIdString = user.id ? user.id.toString() : ""; // Safely convert user.id to string
      return (
        `${user.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userIdString.includes(searchTerm) // Use the safely converted string
      );
    });
  };

  const handleToggleStatus = (org) => {
    const newStatus = org.isActive ? "active" : "inactive";
    dispatch(
      toggleOrgStatus({
        orgId: org.orgId,
        isActive: newStatus,
      })
    ).then(() => {
      setAlertMessage(
        `Organization "${org.name}" status changed to ${newStatus}`
      );
      setShowAlert(true);
    });
  };

  const handleSetRep = (org_id, user_id) => {
    dispatch(setOrgRepresentative({ org_id, rep_id: user_id })).then(() => {
      const rep = getUserById(user_id);
      const orgName = organizations.find((org) => org.orgId === org_id)?.name;
      setAlertMessage(
        `Representative set: ${rep.first_name} ${rep.last_name} for ${orgName}`
      );
      setShowAlert(true);

      dispatch(updateSearchRepMap({ orgId: org_id, searchTerm: "" }));
      setShowRepList((prev) => ({ ...prev, [org_id]: false }));
    });
  };

  const handleRemoveRep = (org_id) => {
    dispatch(setOrgRepresentative({ org_id, rep_id: null })).then(() => {
      const orgName = organizations.find((org) => org.orgId === org_id)?.name;
      setAlertMessage(`Representative removed from ${orgName}`);
      setShowAlert(true);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableOrg((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrg = () => {
    dispatch(addOrganization(editableOrg)).then(() => {
      setShowAddModal(false);
      resetFormState();
      setAlertMessage(
        `Organization "${editableOrg.org_name}" added successfully`
      );
      setShowAlert(true);
    });
  };

  const handleUpdateOrg = () => {
    dispatch(updateOrganization(editableOrg)).then(() => {
      setShowEditModal(false);
      resetFormState();
      setAlertMessage(
        `Organization "${editableOrg.org_name}" updated successfully`
      );
      setShowAlert(true);
    });
  };

  const openEditModal = (org) => {
    setEditableOrg({ ...org });
    setShowEditModal(true);
  };

  const resetFormState = () => {
    setEditableOrg({
      org_name: "",
      description: "",
      category: "",
      isActive: "active",
      rep_id: null,
    });
  };

  const handleRepSearch = (orgId, value) => {
    dispatch(updateSearchRepMap({ orgId, searchTerm: value }));
    setShowRepList((prev) => ({ ...prev, [orgId]: true }));
  };

  const formatRepName = (repId) => {
    const rep = getUserById(repId);
    return rep ? `${rep.first_name} ${rep.last_name}` : "None";
  };

  const RepSelector = ({ orgId, currentRepId, inModal = false }) => {
    const rep = getUserById(currentRepId);

    return (
      <div className="position-relative rep-selector">
        {rep ? (
          <div className="current-rep mb-2">
            <Badge
              bg="info"
              className="rep-badge d-flex align-items-center gap-2 justify-content-between"
            >
              <span>
                {rep.first_name} {rep.last_name}
              </span>
              <Button
                variant="link"
                size="sm"
                className="remove-rep-btn p-0 m-0"
                onClick={() => handleRemoveRep(orgId)}
              >
                ×
              </Button>
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
  value={searchRepMapFromRedux[orgId] || ""}
  onChange={(e) => handleRepSearch(orgId, e.target.value)}
  onFocus={() =>
    setShowRepList((prev) => ({ ...prev, [orgId]: true }))
  }
  ref={(el) => {
    searchInputRefs.current[orgId] = el;
    if (el) el.focus();  // Manually ensure focus on input
  }}
  style={{ zIndex: 999 }} // Ensuring it's clickable if there are overlapping elements
/>

            </InputGroup>
          </>
        )}

        {showRepList[orgId] && (
          <ListGroup
            className="position-absolute w-100 shadow-sm rep-list-container"
            ref={(el) => (repListRefs.current[orgId] = el)}
          >
            {getFilteredUsers(orgId).map((user) => (
              <ListGroup.Item
                key={user.user_id}
                className="rep-list-item"
                action
              >
                <span className="rep-name">
                  {user.first_name} {user.last_name} (ID: {user.user_id})
                </span>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleSetRep(orgId, user.user_id)}
                >
                  ✓
                </Button>
              </ListGroup.Item>
            ))}
            {getFilteredUsers(orgId).length === 0 && (
              <ListGroup.Item>No users found</ListGroup.Item>
            )}
          </ListGroup>
        )}
      </div>
    );
  };

  // Create safe category array for dropdowns
  const getCategoryOptions = () => {
    const categories = getCategories().filter((cat) => cat !== "all");
    return categories.map((category) => {
      const categoryValue =
        typeof category === "object"
          ? category.name || category.category || JSON.stringify(category)
          : category;

      return (
        <option key={categoryValue} value={categoryValue}>
          {categoryValue}
        </option>
      );
    });
  };

  return (
    <div className="orgs-management">
      <h2 className="my-4">Organizations Management</h2>

      {showAlert && (
        <Alert
          variant="success"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}

      {/* Category filter */}
      <div className="category-filter mb-4">
        <Form.Group>
          <Form.Label>Filter by Category</Form.Label>
          <Form.Select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {getCategories().map((category) => {
              const categoryValue =
                typeof category === "object"
                  ? category.name || category.category || String(category)
                  : category;
              const displayText =
                categoryValue === "all" ? "All Categories" : categoryValue;
              return (
                <option key={categoryValue} value={categoryValue}>
                  {displayText}
                </option>
              );
            })}
          </Form.Select>
        </Form.Group>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="mb-4">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Category</th>
                {/* <th>Description</th> */}
                <th>Status</th>
                <th>Representative</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrgs().map((org) => (
                <tr key={org.org_id}>
                  <td>{org.name}</td>
                  <td>{org.category?.name || "N/A"}</td>

                  {/* <td>{org.description}</td> */}
                  <td>
                    <Button
                      variant={org.isActive ? "success" : "danger"}
                      size="sm"
                      onClick={() => handleToggleStatus(org)}
                    >
                      {org.isActive ? "Active" : "Inactive"}
                    </Button>
                  </td>
                  <td className="rep-column">
                    <RepSelector
                      orgId={org.orgId}
                      currentRepId={org.representative?.id}
                    />
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openEditModal(org)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Button variant="success" onClick={() => setShowAddModal(true)}>
        Add Organization
      </Button>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="orgName">
              <Form.Label>Organization Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter organization name"
                name="org_name"
                value={editableOrg.org_name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="orgCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={editableOrg.category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                {getCategoryOptions()}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="orgDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                name="description"
                value={editableOrg.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="orgStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editableOrg.isActive}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="orgRep">
              <Form.Label>Representative</Form.Label>
              {/* Use 0 as temporary ID for new org */}
              <RepSelector
                orgId={0}
                currentRepId={editableOrg.rep_id}
                inModal={true}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddOrg} disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Add Organization"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="editOrgName">
              <Form.Label>Organization Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter organization name"
                name="org_name"
                value={editableOrg.org_name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editOrgCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={editableOrg.category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                {getCategoryOptions()}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="editOrgDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                name="description"
                value={editableOrg.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editOrgStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editableOrg.isActive}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="editOrgRep">
              <Form.Label>Representative</Form.Label>
              {editableOrg.org_id && (
                <RepSelector
                  orgId={editableOrg.org_id}
                  currentRepId={editableOrg.rep_id}
                  inModal={true}
                />
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateOrg}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrgsManagement;
