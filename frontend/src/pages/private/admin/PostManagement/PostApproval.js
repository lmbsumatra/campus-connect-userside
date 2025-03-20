import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./postDashboard.css";
import ActionModal from "../common/ActionModal";
import FetchPostData from "../../../../utils/FetchPostData";
import { useParams } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import PostPreview from "./PostPreview";
import { useAuth } from "../../../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminPostById } from "../../../../redux/post/adminPostByIdSlice";

const PostApproval = () => {
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const [status, setStatus] = useState(null);
  const { adminUser } = useAuth();
  const dispatch = useDispatch();

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const { adminPostById, loadingAdminPostById, errorAdminPostById } =
    useSelector((state) => state.adminPostById);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminPostById({ id }));
    }
  }, [id, dispatch]);

  const formLabels = {
    approvalLabel: "Are you sure you want to approve the post?",
    reasonForDenialLabel: "Reason(s) for Denial",
    removalLabel: "Are you sure you want to remove the post?",
    reasonForRestrictionLabel: "Reason(s) for Restriction",
    actionLabel: "Action",
    additionalReasonLabel: "Reason",
  };

  const handleStatusChange = async (selectedAction, reason) => {
    // console.log("Admin user token being sent:", adminUser?.token);
    try {
      const response = await fetch(`http://localhost:3001/posts/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser?.token}`,
        },
        body: JSON.stringify({ status: selectedAction, reason }),
      });

      // Add this to see the complete response
      const responseData = await response.json();
      // console.log("Response status:", response.status);
      // console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setStatus(selectedAction);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      handleCloseModal();
    }
  };

  const { label, className } = ItemStatus(adminPostById?.status);

  return (
    <div className="admin-content-container">
      <span>
        Status: <span className={`badge ${className} ms-2`}>{label}</span>
      </span>
      <PostPreview
        selectedItem={adminPostById}
        isAdmin={true}
        loading={loadingAdminPostById}
        error={errorAdminPostById}
      />
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
        title="Update Post Status"
        formLabels={formLabels}
        onConfirm={handleStatusChange}
        status={adminPostById?.status || status}
      />
    </div>
  );
};

export default PostApproval;
