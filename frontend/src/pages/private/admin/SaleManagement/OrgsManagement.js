import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "@mui/material";
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
import OrgFormModal from "./OrgFormModal";

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
    isActive: true,
    rep_id: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "org_name",
    direction: "asc",
  });

  // Refs for handling clicks outside of components
  const repListRefs = useRef({});
  const searchInputRefs = useRef({});
  const focusHandledRef = useRef({});

  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        dispatch(clearError());
        console.log("Loading timeout triggered - forcing reset");
      }, 10000);
    }
    return () => clearTimeout(timeoutId);
  }, [loading, dispatch]);

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
  // Modify the useEffect for handling clicks outside
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
          // Only close if we're not clicking in the input itself
          setShowRepList((prev) => ({ ...prev, [orgId]: false }));
          // Reset focus handling flag when closing
          focusHandledRef.current[orgId] = false;
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
  // Filter organizations by category and search term
  const getFilteredOrgs = () => {
    let filteredOrgs = organizations;

    // Filter by category
    if (activeCategory !== "all") {
      filteredOrgs = filteredOrgs.filter(
        (org) => org.category.name === activeCategory
      );
    }

    // Filter by search term (organization name)
    if (searchTerm) {
      filteredOrgs = filteredOrgs.filter((org) =>
        (org.name || org.org_name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    return filteredOrgs;
  };

  const getUserById = (userId) => {
    if (!userId) return null;
    return users.find((user) => user.user_id === userId);
  };

  const getFilteredUsers = (orgId) => {
    const searchTerm = searchRepMapFromRedux[orgId] || "";
    return users.filter((user) => {
      const userNameLower = `${user.first_name || ""} ${
        user.last_name || ""
      }`.toLowerCase();
      const userIdString = String(user.user_id || "");
      return (
        userNameLower.includes(searchTerm.toLowerCase()) ||
        userIdString.includes(searchTerm)
      );
    });
  };

  const handleToggleStatus = (org) => {
    // Get the correct orgId
    const orgId = org.orgId || org.org_id;

    const newStatus = org.isActive ? "inactive" : "active";
    dispatch(
      toggleOrgStatus({
        orgId: orgId,
        isActive: newStatus,
      })
    ).then(() => {
      setAlertMessage(
        `Organization "${
          org.name || org.org_name
        }" status changed to ${newStatus}`
      );
      setShowAlert(true);
    });
  };

  const handleSetRep = async (org_id, user_id) => {
    await dispatch(setOrgRepresentative({ orgId: org_id, rep_id: user_id }));
    const rep = getUserById(user_id);
    const orgName =
      organizations.find((org) => org.orgId === org_id)?.name || "Organization";

    setAlertMessage(
      `Representative set: ${rep?.first_name || ""} ${
        rep?.last_name || ""
      } for ${orgName}`
    );
    setShowAlert(true);
    setShowRepList((prev) => ({ ...prev, [org_id]: false }));
    dispatch(updateSearchRepMap({ orgId: org_id, searchTerm: "" }));
  };

  const handleRemoveRep = (org_id) => {
    dispatch(setOrgRepresentative({ orgId: org_id, rep_id: null })).then(() => {
      const orgName =
        organizations.find((org) => (org.orgId || org.org_id) === org_id)
          ?.name || "Organization";

      setAlertMessage(`Representative removed from ${orgName}`);
      setShowAlert(true);

      // Reset the focus handled flag for this org
      focusHandledRef.current[org_id] = false;
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
    const orgToEdit = {
      org_id: org.orgId || org.org_id,
      org_name: org.name || org.org_name,
      description: org.description || "",
      category: org.category?.name || org.category || "",
      isActive: org.isActive ? "active" : "inactive",
      rep_id: org.representative?.id || org.rep_id,
    };
    setEditableOrg(orgToEdit);
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
    // Prevent unnecessary dispatches if the value hasn't changed
    if (searchRepMapFromRedux[orgId] !== value) {
      dispatch(updateSearchRepMap({ orgId, searchTerm: value }));
    }
  };

  const toggleRepList = (orgId, show) => {
    if (showRepList[orgId] !== show) {
      setShowRepList((prev) => ({ ...prev, [orgId]: show }));
    }
  };

  const formatRepName = (repId) => {
    const rep = getUserById(repId);
    return rep ? `${rep.first_name} ${rep.last_name}` : "None";
  };

  const RepSelector = ({ orgId, currentRepId, inModal = false }) => {
    const rep = getUserById(currentRepId);
    const initialSearchValue = searchRepMapFromRedux[orgId] || "";
    const [localSearch, setLocalSearch] = useState(initialSearchValue);

    useEffect(() => {
      if (
        showRepList[orgId] &&
        searchInputRefs.current[orgId] &&
        !focusHandledRef.current[orgId]
      ) {
        searchInputRefs.current[orgId].focus();
        focusHandledRef.current[orgId] = true;
      }
    }, [showRepList[orgId], orgId]);

    useEffect(() => {
      setLocalSearch(initialSearchValue);
    }, [initialSearchValue, showRepList[orgId]]);

    const filteredUsers = users.filter((user) => {
      const userNameLower = `${user.first_name || ""} ${
        user.last_name || ""
      }`.toLowerCase();
      const userIdString = String(user.user_id || "");
      return (
        userNameLower.includes(localSearch.toLowerCase()) ||
        userIdString.includes(localSearch)
      );
    });

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
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onFocus={() => toggleRepList(orgId, true)}
                onBlur={() => {
                  dispatch(
                    updateSearchRepMap({ orgId, searchTerm: localSearch })
                  );
                }}
                ref={(el) => {
                  searchInputRefs.current[orgId] = el;
                }}
                aria-label="Search representatives"
              />
            </InputGroup>
          </>
        )}

        {showRepList[orgId] && (
          <ListGroup
            className="position-absolute w-100 shadow-sm rep-list-container"
            ref={(el) => (repListRefs.current[orgId] = el)}
            style={{ zIndex: 1000 }}
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <ListGroup.Item key={user.user_id} className="rep-list-item">
                  <span className="rep-name">
                    {user.first_name} {user.last_name} (ID: {user.user_id})
                  </span>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSetRep(orgId, user.user_id);
                    }}
                  >
                    ✓
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No users found</ListGroup.Item>
            )}
          </ListGroup>
        )}
      </div>
    );
  };

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

  // Sorting function
  const sortedOrgs = (orgs) => {
    const { key, direction } = sortConfig;

    return [...orgs].sort((a, b) => {
      const aVal =
        key === "org_name"
          ? a.name || a.org_name
          : key === "isActive"
          ? a.isActive
          : key === "representative"
          ? formatRepName(a.representative?.id || a.rep_id)
          : a[key];

      const bVal =
        key === "org_name"
          ? b.name || b.org_name
          : key === "isActive"
          ? b.isActive
          : key === "representative"
          ? formatRepName(b.representative?.id || b.rep_id)
          : b[key];

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="mx-5 my-3 orgs-management">
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

      {/* Search bar */}
      <div className="search-bar mb-4">
        <Form.Group>
          <Form.Label>Search by Organization Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Form.Group>
      </div>

      {loading && organizations.length === 0 ? (
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
                <th onClick={() => handleSort("org_name")}>
                  Organization Name{" "}
                  {sortConfig.key === "org_name"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th>
                  Category
                  {/* Category filter */}
                  <div className="category-filter ">
                    <Form.Group>
                      <Form.Select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                      >
                        {getCategories().map((category) => {
                          const categoryValue =
                            typeof category === "object"
                              ? category.name ||
                                category.category ||
                                String(category)
                              : category;
                          const displayText =
                            categoryValue === "all"
                              ? "All Categories"
                              : categoryValue;
                          return (
                            <option key={categoryValue} value={categoryValue}>
                              {displayText}
                            </option>
                          );
                        })}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </th>
                <th onClick={() => handleSort("isActive")}>
                  Status{" "}
                  {sortConfig.key === "isActive"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th onClick={() => handleSort("representative")}>
                  Representative{" "}
                  {sortConfig.key === "representative"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrgs(getFilteredOrgs()).map((org) => (
                <tr key={org.orgId || org.org_id}>
                  <td>
                    <Tooltip title={org.name}>
                      <span className="table-ellipsis">
                        {org.name || org.org_name}
                      </span>
                    </Tooltip>
                  </td>
                  <td>
                    <Tooltip title={org.category?.name}>
                      <span className="table-ellipsis">
                        {org.category?.name || org.category || "N/A"}{" "}
                      </span>
                    </Tooltip>
                  </td>
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
                      orgId={org.orgId || org.org_id}
                      currentRepId={org.representative?.id || org.rep_id}
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

      <OrgFormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddOrg}
        editableOrg={editableOrg}
        setEditableOrg={setEditableOrg}
        categories={getCategoryOptions()}
        mode="add"
      />

      <OrgFormModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateOrg}
        editableOrg={editableOrg}
        setEditableOrg={setEditableOrg}
        categories={getCategoryOptions()}
        mode="edit"
      />
    </div>
  );
};

export default OrgsManagement;
