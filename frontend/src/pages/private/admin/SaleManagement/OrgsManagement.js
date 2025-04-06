import React, { useState } from "react";
import { Button, Modal, Form, Table, ListGroup, InputGroup, Badge } from "react-bootstrap";

const exampleOrgs = [
  { org_id: 1, org_name: "COLLEGE OF ARCHITECTURE AND FINE ARTS", status: "active", rep_id: 1, description: "A college for architecture and fine arts." },
  { org_id: 2, org_name: "ASSOCIATION OF STUDENTS IN INDUSTRIAL ARTS", status: "inactive", rep_id: null, description: "Industrial arts student association." },
 
];

const exampleUsers = [
  { user_id: 1, first_name: "John", last_name: "Doe" },
  { user_id: 2, first_name: "Jane", last_name: "Smith" },
  { user_id: 3, first_name: "Mike", last_name: "Johnson" },
  { user_id: 4, first_name: "Alice", last_name: "Williams" },

];

const OrgsManagement = () => {
  const [orgs, setOrgs] = useState(exampleOrgs);
  const [users] = useState(exampleUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentOrg, setCurrentOrg] = useState({
    org_name: "",
    description: "",
    status: "active",
    rep_id: null
  });
  const [searchRepMap, setSearchRepMap] = useState({});
  const [showRepList, setShowRepList] = useState({});

  const getUserById = (userId) => {
    if (!userId) return null;
    return users.find(user => user.user_id === userId);
  };

  const getFilteredUsers = (orgId) => {
    const searchTerm = searchRepMap[orgId] || "";
    return users.filter(
      (user) =>
        `${user.first_name} ${user.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.user_id.toString().includes(searchTerm)
    );
  };

  const toggleStatus = (org_id) => {
    setOrgs((prevOrgs) =>
      prevOrgs.map((org) =>
        org.org_id === org_id
          ? { ...org, status: org.status === "active" ? "inactive" : "active" }
          : org
      )
    );
  };

  const setRep = (org_id, user_id) => {
    setOrgs((prevOrgs) =>
      prevOrgs.map((org) =>
        org.org_id === org_id ? { ...org, rep_id: user_id } : org
      )
    );
    
    setSearchRepMap(prev => ({ ...prev, [org_id]: "" }));
    setShowRepList(prev => ({ ...prev, [org_id]: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrg((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addOrg = () => {
    const newOrgData = {
      org_id: orgs.length + 1, 
      ...currentOrg,
    };
    setOrgs((prevOrgs) => [...prevOrgs, newOrgData]);
    setShowAddModal(false);
    resetFormState();
  };

  const updateOrg = () => {
    setOrgs((prevOrgs) =>
      prevOrgs.map((org) =>
        org.org_id === currentOrg.org_id ? { ...currentOrg } : org
      )
    );
    setShowEditModal(false);
    resetFormState();
  };

  const openEditModal = (org) => {
    setCurrentOrg({ ...org });
    setShowEditModal(true);
  };

  const resetFormState = () => {
    setCurrentOrg({
      org_name: "",
      description: "",
      status: "active",
      rep_id: null
    });
  };

  const handleRepSearch = (orgId, value) => {
    setSearchRepMap(prev => ({ ...prev, [orgId]: value }));
    setShowRepList(prev => ({ ...prev, [orgId]: true }));
  };

  const formatRepName = (repId) => {
    const rep = getUserById(repId);
    return rep ? `${rep.first_name} ${rep.last_name}` : "None";
  };

  return (
    <div className="container-fluid">
      <h2 className="my-4">Organizations Management</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Organization Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Representative</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr key={org.org_id}>
              <td>{org.org_name}</td>
              <td>{org.description}</td>
              <td>
                <Button 
                  variant={org.status === "active" ? "success" : "danger"} 
                  size="sm"
                  onClick={() => toggleStatus(org.org_id)}
                >
                  {org.status.toUpperCase()}
                </Button>
              </td>
              <td>
                <div className="position-relative">
                  <p>{formatRepName(org.rep_id)}</p>
                  <InputGroup size="sm">
                    <Form.Control
                      placeholder="Search by name or ID"
                      value={searchRepMap[org.org_id] || ""}
                      onChange={(e) => handleRepSearch(org.org_id, e.target.value)}
                      onFocus={() => setShowRepList(prev => ({ ...prev, [org.org_id]: true }))}
                    />
                  </InputGroup>
                  
                  {showRepList[org.org_id] && (
                    <ListGroup className="position-absolute w-100 shadow-sm" style={{ zIndex: 1000 }}>
                      {getFilteredUsers(org.org_id).map((user) => (
                        <ListGroup.Item 
                          key={user.user_id} 
                          className="d-flex justify-content-between align-items-center"
                          action
                        >
                          {user.first_name} {user.last_name} (ID: {user.user_id})
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => setRep(org.org_id, user.user_id)}
                          >
                            ✓
                          </Button>
                        </ListGroup.Item>
                      ))}
                      {getFilteredUsers(org.org_id).length === 0 && (
                        <ListGroup.Item>No users found</ListGroup.Item>
                      )}
                    </ListGroup>
                  )}
                </div>
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

      <Button variant="success" onClick={() => setShowAddModal(true)}>
        Add Organization
      </Button>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
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
                value={currentOrg.org_name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="orgDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                name="description"
                value={currentOrg.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="orgStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={currentOrg.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={addOrg}>
            Add Organization
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
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
                value={currentOrg.org_name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editOrgDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                name="description"
                value={currentOrg.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editOrgStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={currentOrg.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="editOrgRep">
              <Form.Label>Current Representative</Form.Label>
              <p>
                {currentOrg.rep_id ? (
                  <Badge bg="info">{formatRepName(currentOrg.rep_id)}</Badge>
                ) : (
                  "None assigned"
                )}
              </p>
              <Form.Text className="text-muted">
                Representatives can be changed from the main table view.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={updateOrg}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrgsManagement;