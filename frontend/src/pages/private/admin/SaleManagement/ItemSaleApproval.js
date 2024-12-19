import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./forSaleManagement.css";
import ViewItem from "../../users/ViewListing";
import ActionModal from "../../../../components/admin/Action Modal/ActionModal";
import ViewPost from "../../users/post/PostDetail";
import FetchPostData from "../../../../utils/FetchPostData";
import { useParams } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";
import ItemForSalePreview from "./ItemForSalePreview";
import useFetchAllItemsForSaleData from "../../../../utils/FetchAllItemsForSaleData";
import FetchItemForSaleData from "../../../../utils/FetchItemForSaleData";

const ItemSaleApproval = () => {
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const [status, setStatus] = useState(null); // Store current status

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
  const { selectedItem, loading, error, tags } = FetchItemForSaleData({ id });
  const handleStatusChange = async (selectedAction, reason) => {
    try {
      await fetch(`http://localhost:3001/item-for-sale/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedAction }), // Update to new status
      });
      setStatus(selectedAction); // Update local status
      console.log(
        `Status updated to: ${selectedAction} with reason: ${reason}`
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      handleCloseModal(); // Close modal after operation
    }
  };
  const { label, className } = ItemStatus(selectedItem?.status);
  return (
    <div className="admin-content-container">
      <span>
        Status: <span className={`badge ${className} ms-2`}>{label}</span>
      </span>
      {/* Display current status */}
      <ItemForSalePreview
        selectedItem={selectedItem}
        loading={loading}
        error={error}
        tags={tags}
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
        title="Actions for Post"
        formLabels={formLabels}
        onConfirm={handleStatusChange} // Pass the single handler
        status={selectedItem?.status || status} // Ensure it reflects current status
      />
    </div>
  );
};

export default ItemSaleApproval;
