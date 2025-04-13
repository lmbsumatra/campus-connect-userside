import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./forSaleManagement.css";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ActionModal from "../common/ActionModal";
import { ItemStatus } from "../../../../utils/Status";
import ItemForSalePreview from "./ItemForSalePreview";
import { useAuth } from "../../../../context/AuthContext";
import { fetchAdminItemForSaleById } from "../../../../redux/item-for-sale/adminItemForSaleByIdSlice";
import { baseApi } from "../../../../utils/consonants";
import ShowAlert from "../../../../utils/ShowAlert";

const ItemSaleApproval = () => {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const { id } = useParams();
  const dispatch = useDispatch();
  const { adminUser } = useAuth();

  const formLabels = {
    approvalLabel: "Are you sure you want to approve the item?",
    reasonForDenialLabel: "Reason(s) for Denial",
    removalLabel: "Are you sure you want to remove the item?",
    reasonForRestrictionLabel: "Reason(s) for Restriction",
    actionLabel: "Action",
    additionalReasonLabel: "Reason",
  };
  // Redux state
  const {
    adminItemForSaleById,
    loadingAdminItemForSaleById,
    errorAdminItemForSaleById,
  } = useSelector((state) => state.adminItemForSaleById);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminItemForSaleById({ id }));
    }
  }, [id, dispatch]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleStatusChange = async (selectedAction, reason) => {
    try {
      const response = await fetch(`${baseApi}/item-for-sale/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser?.token}`,
        },
        body: JSON.stringify({ status: selectedAction, reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item status");
      }

      await ShowAlert(
        dispatch,
        "success",
        "Status Updated",
        `Item status updated to ${selectedAction} successfully!`
      );

      setStatus(selectedAction);
      setStatusMessage(reason);

      // Refetch data to update UI
      dispatch(fetchAdminItemForSaleById({ id }));
    } catch (error) {
      await ShowAlert(
        dispatch,
        "error",
        "Update Failed",
        error.message || "Failed to update item status"
      );
    } finally {
      handleCloseModal();
    }
  };

  // Get status label and style class
  const { label, className } = ItemStatus(
    adminItemForSaleById?.status || status
  );

  return (
    <div className="admin-content-container">
      <div className="status-container mb-3">
        <h4>
          Status: <span className={`badge ${className} ms-2`}>{label}</span>
        </h4>

        {/* Show reason if available */}
        {(adminItemForSaleById?.statusReason || statusMessage) && (
          <p className="status-reason">
            <strong>Reason:</strong>{" "}
            {adminItemForSaleById?.statusReason || statusMessage}
          </p>
        )}
      </div>

      <ItemForSalePreview
        selectedItem={adminItemForSaleById}
        loading={loadingAdminItemForSaleById}
        error={errorAdminItemForSaleById}
        isAdmin={true}
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
        title="Update Listing Status"
        formLabels={formLabels}
        onConfirm={handleStatusChange}
        status={adminItemForSaleById?.status || status}
      />
    </div>
  );
};

export default ItemSaleApproval;
