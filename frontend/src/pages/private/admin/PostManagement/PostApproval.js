import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./postDashboard.css";
import ActionModal from "../../../../components/admin/Action Modal/ActionModal";
import FetchPostData from "../../../../utils/FetchPostData";
import { useParams } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import PostPreview from "./PostPreview";
import { useAuth } from "../../../../context/AuthContext";

const PostApproval = () => {
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const [status, setStatus] = useState(null);
  const { adminUser } = useAuth();

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const formLabels = {
    approvalLabel: "Are you sure you want to approve the post?",
    reasonForDenialLabel: "Reason(s) for Denial",
    removalLabel: "Are you sure you want to remove the post?",
    reasonForRestrictionLabel: "Reason(s) for Restriction",
    actionLabel: "Action",
    additionalReasonLabel: "Reason",
  };

  const { selectedPost, loading, error, tags } = FetchPostData({ id });

  if (loading) return <p>Loading...</p>; // Show loading state
  if (error) return <p>{error}</p>; // Show error message

  if (!selectedPost) {
    return <p>Item not found.</p>; // Show item not found message if no post data
  }

  const handleStatusChange = async (selectedAction, reason) => {
    try {
      await fetch(`http://localhost:3001/posts/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser?.token}`,
        },
        body: JSON.stringify({ status: selectedAction, reason }),
      });
      setStatus(selectedAction);
      console.log(
        `Status updated to: ${selectedAction} with reason: ${reason}`
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      handleCloseModal();
    }
  };

  const { label, className } = ItemStatus(selectedPost?.status);

  return (
    <div className="admin-content-container">
      <span>
        Status: <span className={`badge ${className} ms-2`}>{label}</span>
      </span>
      <PostPreview selectedPost={selectedPost} tags={tags} />
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-rectangle primary no-fill my-3 me-4 btn-lg"
          type="button"
          onClick={handleOpenModal}
        >
          Action
        </button>
      </div>
      <ActionModal
        show={showModal}
        onHide={handleCloseModal}
        title="Actions for Post"
        formLabels={formLabels}
        onConfirm={handleStatusChange}
        status={selectedPost?.status || status}
      />
    </div>
  );
};

export default PostApproval;
