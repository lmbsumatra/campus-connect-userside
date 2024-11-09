import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../postDashboard.css";
import ProfileSidebar from "../../../../../components/User/sidebar/ProfileSidebar";
import ProfileHeader from "../../../../../components/User/header/ProfileHeader";
import { Outlet, useParams } from "react-router-dom";
import ActionModal from "../../../../../components/admin/Action Modal/ActionModal";

const UserVerification = () => {
  const { id } = useParams();
  console.log(id);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Custom labels for the modal
  const formLabels = {
    approvalLabel: "Are you sure you want to approve the post?",
    reasonForDenialLabel: "Reason(s) for Denial",
    removalLabel: "Are you sure you want to remove the post?",
    reasonForRestrictionLabel: "Reason(s) for Restriction",
    actionLabel: "Action",
    additionalReasonLabel: "Reason",
  };

  return (
    <div className="admin-content-container">
      <div className="gap-3 d-flex">
        <ProfileSidebar className="profile-sidebar m-0 p-0 lh-0 bg-dark h-100 " />
        <div className="profile-content m-0 p-0 lh-0 w-50">
          <ProfileHeader className="m-0 p-0" userId={id} />
          <div className="m-0 p-0">
            {/* <Outlet /> */}
          </div>
        </div>
      </div>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-rectangle primary no-fill my-3 me-4 btn-lg"
          type="button"
          onClick={handleOpenModal}
        >
          Action
        </button>
      </div>

      {/* Action Modal */}
      <ActionModal
        show={showModal}
        onHide={handleCloseModal}
        title="Actions for Post"
        formLabels={formLabels}
      />
    </div>
  );
};

export default UserVerification;
