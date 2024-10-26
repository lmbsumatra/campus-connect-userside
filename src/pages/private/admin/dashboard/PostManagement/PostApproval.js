import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './postDashboard.css';
import ViewItem from '../../../../../components/listings/ViewItem';
import ActionModal from '../../../../../components/Action Modal/ActionModal';

const PostApproval = () => {
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
    additionalReasonLabel: "Reason"
  };

  return (
    <div className="container my-2">
      <ViewItem />
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

export default PostApproval;
