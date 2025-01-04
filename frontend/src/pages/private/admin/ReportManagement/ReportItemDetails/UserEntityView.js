import React from "react";

const UserEntityView = ({ entityDetails }) => {
  if (!entityDetails) return <div>No details available for this User.</div>;


  return (
    <div className="entity-details">
      <div className="entity-row">
        <span className="entity-label">First Name:</span>
        <span className="entity-value">{entityDetails.first_name || "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Last Name:</span>
        <span className="entity-value">{entityDetails.last_name || "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Middle Name:</span>
        <span className="entity-value">{entityDetails.middle_name || "N/A"}</span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Email:</span>
        <span className="entity-value">{entityDetails.email || "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">TUP ID:</span>
        <span className="entity-value">
            {entityDetails.student?.tup_id || "Not Available"}
        </span>
        </div>
        <div className="entity-row">
        <span className="entity-label">College:</span>
        <span className="entity-value">
            {entityDetails.student?.college || "Not Available"}
        </span>
        </div>
    </div>
  );
};

export default UserEntityView;
