import React from "react";
import "./EntityView.css"

const UserEntityView = ({ entityDetails }) => {
  if (!entityDetails) return <div>No details available for this User.</div>;

  // Extract profile picture URL
  const profilePic = entityDetails.student?.profile_pic;


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
       {/* Profile Picture Display */}
       {profilePic ? (
        <div className="entity-row">
          <span className="entity-label">Profile Picture:</span>
          <div className="image-gallery">
            <img
              src={profilePic}
              alt="Profile"
              className="entity-image"
              style={{ width: "150px", height: "150px", borderRadius: "50%" }}
            />
          </div>
        </div>
      ) : (
        <div className="entity-row">
          <span className="entity-label">Profile Picture:</span>
          <span className="entity-value">No Profile Picture Available</span>
        </div>
      )}
    </div>
  );
};

export default UserEntityView;
