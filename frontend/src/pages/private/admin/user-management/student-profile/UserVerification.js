import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../postDashboard.css";
import { useParams } from "react-router-dom";
import ActionModal from "../../../../../components/admin/Action Modal/ActionModal";
import FetchUserInfoForAdmin from "../../../../../utils/FetchUserInfoAdmin";

const UserVerification = () => {
  const { id } = useParams();
  const { user, student, loading, errorMessage } = FetchUserInfoForAdmin(id); 

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="admin-content-container">
      <div className="gap-3 d-flex">
        <div className="profile-content m-0 p-0 lh-0 w-50">
          {loading ? (
            <p>Loading user data...</p>
          ) : errorMessage ? (
            <p className="text-danger">{errorMessage}</p>
          ) : (
            <div className="user-info">
              <h3>User Information</h3>
              <p><strong>Name:</strong> {user.fname} {user.mname} {user.lname}</p>
              <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
              <p><strong>Join Date:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>

              <h3>Student Information</h3>
              <p><strong>ID:</strong> {student.id}</p>
              <p><strong>College:</strong> {student.college}</p>

              {student.profilePic && (
                <div>
                  <h4>Profile Picture</h4>
                  <img src={student.profilePic} alt="Profile" width="150px" />
                </div>
              )}

              {student.scannedId && (
                <div>
                  <h4>Scanned ID</h4>
                  <img src={student.scannedId} alt="Scanned ID" width="150px" />
                </div>
              )}

              {student.photoWithId && (
                <div>
                  <h4>Photo with ID</h4>
                  <img src={student.photoWithId} alt="Photo with ID" width="150px" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-rectangle primary no-fill my-3 me-4 btn-lg"
          type="button"
          onClick={() => setShowModal(true)}
        >
          Action
        </button>
      </div>

      <ActionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Actions for Post"
        formLabels={{
          approvalLabel: "Are you sure you want to approve the post?",
          reasonForDenialLabel: "Reason(s) for Denial",
          removalLabel: "Are you sure you want to remove the post?",
          reasonForRestrictionLabel: "Reason(s) for Restriction",
          actionLabel: "Action",
          additionalReasonLabel: "Reason",
        }}
      />
    </div>
  );
};

export default UserVerification;
