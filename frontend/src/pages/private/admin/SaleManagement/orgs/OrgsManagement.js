import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "@mui/material";
import { Button, Form, Table, Alert, Spinner } from "react-bootstrap";
import "./OrgsManagement.css";

import {
  fetchOrganizations,
  fetchCategories,
  fetchUsers,
  addOrganization,
  updateOrganization,
  toggleOrgStatus,
  clearCurrentOrg,
  clearError,
  selectOrganizations,
  selectCategories,
  selectUsers,
  selectLoading,
  selectError,
} from "../../../../../redux/orgs/organizationsSlice";
import OrgFormModal from "./OrgFormModal";
import RepSelector from "./RepSelector";
import PaginationComponent from "../../../../../components/Pagination/PaginationComponent";

const OrgsManagement = () => {
  const dispatch = useDispatch();
  const organizations = useSelector(selectOrganizations);
  const categoriesFromRedux = useSelector(selectCategories);
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRepList, setShowRepList] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editableOrg, setEditableOrg] = useState({
    org_name: "",
    description: "",
    category: "",
    isActive: true,
    rep_id: null,
    logo_file: null,
    logo_url: null,
    logo_name: null,
    logo: null,
    remove_logo: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "org_name",
    direction: "asc",
  });

  const repListRefs = useRef({});
  const searchInputRefs = useRef({});
  const focusHandledRef = useRef({});

  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        dispatch(clearError());
      }, 10000);
    }
    return () => clearTimeout(timeoutId);
  }, [loading, dispatch]);

  useEffect(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchCategories());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearCurrentOrg());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setAlertMessage(error);
      setAlertVariant("danger");
      setShowAlert(true);
    }
  }, [error]);

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
          focusHandledRef.current[orgId] = false;
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRepList]);

  const getUserById = (userId) => {
    if (!userId) return null;
    return users.find((user) => user.user_id === userId);
  };

  const formatRepName = (repId) => {
    const rep = getUserById(repId);
    return rep ? `${rep.first_name} ${rep.last_name}` : "None";
  };

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

  const getCategoriesFromOrgs = () => {
    const uniqueCategories = [
      ...new Set(organizations.map((org) => org.category)),
    ];
    return ["all", ...uniqueCategories.sort()];
  };

  const getCategories = () => {
    const processedCategories = processCategories();
    return processedCategories.length > 1
      ? processedCategories
      : getCategoriesFromOrgs();
  };

  const getFilteredOrgs = () => {
    let filteredOrgs = organizations;

    if (activeCategory !== "all") {
      filteredOrgs = filteredOrgs.filter(
        (org) => org.category.name === activeCategory
      );
    }

    if (searchTerm) {
      filteredOrgs = filteredOrgs.filter((org) =>
        (org.name || org.org_name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    return filteredOrgs;
  };

  const filteredOrgs = getFilteredOrgs();
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
  const sortedFilteredOrgs = sortedOrgs(filteredOrgs);

  const totalPages = Math.ceil(sortedFilteredOrgs.length / itemsPerPage);
  const paginatedOrgs = sortedFilteredOrgs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const displayAlert = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
  };

  const handleToggleStatus = (org) => {
    const orgId = org.orgId || org.org_id;
    const orgName = org.name || org.org_name;
    const newStatus = org.isActive ? "inactive" : "active";

    dispatch(
      toggleOrgStatus({
        orgId: orgId,
        isActive: newStatus,
      })
    )
      .then(() => {
        displayAlert(
          `Organization "${orgName}" status changed to ${newStatus}`,
          newStatus === "active" ? "success" : "warning"
        );
      })
      .catch((err) => {
        displayAlert(`Failed to update status: ${err.message}`, "danger");
      });
  };

  const handleAddOrg = () => {
    dispatch(addOrganization(editableOrg))
      .then(() => {
        setShowAddModal(false);
        resetFormState();
        displayAlert(
          `Organization "${editableOrg.org_name}" added successfully`,
          "success"
        );
      })
      .catch((err) => {
        displayAlert(`Failed to add organization: ${err.message}`, "danger");
      });
  };

  const handleUpdateOrg = () => {
    dispatch(updateOrganization(editableOrg))
      .then(() => {
        setShowEditModal(false);
        resetFormState();
        displayAlert(
          `Organization "${editableOrg.org_name}" updated successfully`,
          "success"
        );
      })
      .catch((err) => {
        displayAlert(`Failed to update organization: ${err.message}`, "danger");
      });
  };

  const openEditModal = (org) => {
    const orgToEdit = {
      org_id: org.orgId || org.org_id,
      org_name: org.name || org.org_name,
      description: org.description || "",
      category: org.category?.name || org.category || "",
      isActive: org.isActive ? "active" : "inactive",
      rep_id: org.representative?.id || null,
      logo: org.logo || null,
    };
    setEditableOrg(orgToEdit);
    setShowEditModal(true);
  };

  const resetFormState = () => {
    setEditableOrg({
      org_name: "",
      description: "",
      category: "",
      logo: "",
      isActive: "active",
      rep_id: null,
    });
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div
      className="mx-4 my-3 px-2 orgs-management"
      style={{ borderRadius: "8px", background: "white" }}
    >
      <h2 className="my-4">Organizations Management</h2>

      {showAlert && (
        <Alert
          variant={alertVariant}
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
        <div
          className="table-responsive"
          style={{ borderRadius: "8px", background: "white" }}
        >
          <Table striped bordered hover className="mb-4">
            <thead>
              <tr>
                <th>Logo</th>
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
              {paginatedOrgs.map((org) => (
                <tr key={org.orgId || org.org_id}>
                  <td>
                    <img
                      src={org.logo}
                      alt="Organization Logo"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        display: org.logo ? "block" : "none",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#ccc",
                        display: org.logo ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {org?.org_name
                        ? org.org_name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  </td>

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
                      users={users.filter(
                        (user) =>
                          !organizations.some(
                            (o) =>
                              (o.representative?.id || o.rep_id) ===
                                user.user_id &&
                              (o.orgId || o.org_id) !==
                                (org.orgId || org.org_id)
                          )
                      )}
                      repListRefs={repListRefs}
                      showRepList={showRepList}
                      searchInputRefs={searchInputRefs}
                      setShowRepList={setShowRepList}
                      setShowAlert={setShowAlert}
                      setAlertMessage={setAlertMessage}
                      setAlertVariant={setAlertVariant}
                      displayAlert={displayAlert}
                      organizations={organizations}
                      focusHandledRef={focusHandledRef}
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

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

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
        users={users}
        organizations={organizations}
        showRepList={showRepList}
        setShowRepList={setShowRepList}
        repListRefs={repListRefs}
        searchInputRefs={searchInputRefs}
        setShowAlert={setShowAlert}
        setAlertMessage={setAlertMessage}
        setAlertVariant={setAlertVariant}
        displayAlert={displayAlert}
        focusHandledRef={focusHandledRef}
      />

      <OrgFormModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateOrg}
        editableOrg={editableOrg}
        setEditableOrg={setEditableOrg}
        categories={getCategoryOptions()}
        mode="edit"
        users={users}
        organizations={organizations}
        showRepList={showRepList}
        setShowRepList={setShowRepList}
        repListRefs={repListRefs}
        searchInputRefs={searchInputRefs}
        setShowAlert={setShowAlert}
        setAlertMessage={setAlertMessage}
        setAlertVariant={setAlertVariant}
        displayAlert={displayAlert}
        focusHandledRef={focusHandledRef}
      />
    </div>
  );
};

export default OrgsManagement;
