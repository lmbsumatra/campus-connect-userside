import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  ListGroup,
  InputGroup,
  Badge,
} from "react-bootstrap";
import "./OrgsManagement.css";
import {
  setOrgRepresentative,
  updateSearchRepMap,
  selectSearchRepMap,
} from "../../../../../redux/orgs/organizationsSlice";

const RepSelector = ({
  orgId,
  currentRepId,
  users = [],
  repListRefs = [],
  showRepList = [],
  searchInputRefs = [],
  setShowRepList,
  setShowAlert,
  setAlertMessage,
  organizations = [],
  focusHandledRef,
}) => {
  const getUserById = (userId) => {
    if (!userId) return null;
    return users.find((user) => user.user_id === userId);
  };
  const rep = getUserById(currentRepId);
  const searchRepMapFromRedux = useSelector(selectSearchRepMap);
  const initialSearchValue = searchRepMapFromRedux[orgId] || "";
  const [localSearch, setLocalSearch] = useState(initialSearchValue);
  const dispatch = useDispatch();

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

  const handleRemoveRep = (org_id) => {
    dispatch(setOrgRepresentative({ orgId: org_id, rep_id: null })).then(() => {
      const orgName =
        organizations.find((org) => (org.orgId || org.org_id) === org_id)
          ?.name || "Organization";

      setAlertMessage(`Representative removed from ${orgName}`);
      setShowAlert(true);

      focusHandledRef.current[org_id] = false;
    });
  };

  const toggleRepList = (orgId, show) => {
    if (showRepList[orgId] !== show) {
      setShowRepList((prev) => ({ ...prev, [orgId]: show }));
    }
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

export default RepSelector;
