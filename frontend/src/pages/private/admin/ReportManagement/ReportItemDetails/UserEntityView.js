import React from "react";
import "./EntityView.css";

const UserEntityView = ({ entityDetails }) => {
  if (!entityDetails) return <div>No details available for this User.</div>;

  // Extract profile picture URL
  const profilePic = entityDetails.student?.profile_pic;

  return (
    <div className="entity-details">
      <div className="entity-row">
        <span className="entity-label">First Name:</span>
        <span className="entity-value">
          {entityDetails.first_name || "N/A"}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Last Name:</span>
        <span className="entity-value">{entityDetails.last_name || "N/A"}</span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Middle Name:</span>
        <span className="entity-value">
          {entityDetails.middle_name || "N/A"}
        </span>
      </div>
      <div className="entity-row">
        <span className="entity-label">Email:</span>
        <span className="entity-value">{entityDetails.email || "N/A"}</span>
      </div>

      {/* Student details section */}
      {entityDetails.student && (
        <div className="entity-section">
          <h4 className="entity-section-title">Student Information</h4>
          <div className="entity-row">
            <span className="entity-label">TUP ID:</span>
            <span className="entity-value">
              {entityDetails.student.tup_id || "Not Available"}
            </span>
          </div>
          <div className="entity-row">
            <span className="entity-label">College:</span>
            <span className="entity-value">
              {entityDetails.student.college || "Not Available"}
            </span>
          </div>
        </div>
      )}

      {/* Profile Picture Display */}
      {profilePic ? (
        <div className="entity-row">
          <span className="entity-label">Profile Picture:</span>
          <div className="image-gallery">
            <img
              src={profilePic}
              alt="Profile"
              className="entity-image profile-image"
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
