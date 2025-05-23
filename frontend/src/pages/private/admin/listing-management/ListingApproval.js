import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
//import "./listingDashboard.css";
import { useParams, useNavigate } from "react-router-dom";
import ListingPreview from "./ListingPreview";
import { ItemStatus } from "../../../../utils/Status";
import { useAuth } from "../../../../context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminListingById } from "../../../../redux/listing/adminListingByIdSlice";
import ActionModal from "../common/ActionModal";
import { baseApi } from "../../../../utils/consonants";
import ShowAlert from "../../../../utils/ShowAlert";

const ListingApproval = () => {
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const { adminUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { adminListingById, loadingAdminListingById, errorAdminListingById } =
    useSelector((state) => state.adminListingById);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminListingById({ id }));
    }
  }, [id, dispatch]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const formLabels = {
    approvalLabel: "Are you sure you want to approve the listing?",
    reasonForDenialLabel: "Reason(s) for Denial",
    removalLabel: "Are you sure you want to remove the listing?",
    reasonForRestrictionLabel: "Reason(s) for Restriction",
    actionLabel: "Action",
    additionalReasonLabel: "Reason",
  };

  const handleStatusChange = async (selectedAction, reason) => {
    try {
      const response = await fetch(`${baseApi}/listings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser?.token}`,
        },
        body: JSON.stringify({
          status: selectedAction,
          reason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update listing status");
      }

      // Show success alert
      await ShowAlert(
        dispatch,
        "success",
        "Status Updated",
        `Listing status updated to ${selectedAction} successfully!`
      );

      // Update local state
      setStatus(selectedAction);
      setStatusMessage(reason);

      // Refetch the listing to get updated data
      dispatch(fetchAdminListingById({ id }));
    } catch (error) {
      // console.error("Error updating status:", error);
      await ShowAlert(
        dispatch,
        "error",
        "Update Failed",
        error.message || "Failed to update listing status."
      );
    } finally {
      handleCloseModal();
    }
  };

  // Get status display information
  const getStatusInfo = () => {
    const currentStatus = adminListingById?.status || status;
    return ItemStatus(currentStatus);
  };

  const { label, className } = getStatusInfo();

  return (
    <div className="listing-approval-container">
      <div className="status-container mb-3">
        <h4>
          Status: <span className={`badge ${className} ms-2`}>{label}</span>
        </h4>

        {/* If there's a status message/reason, display it */}
        {(adminListingById?.statusReason || statusMessage) && (
          <p className="status-reason">
            <strong>Reason:</strong>{" "}
            {adminListingById?.statusReason || statusMessage}
          </p>
        )}
      </div>

      <ListingPreview
        selectedItem={adminListingById}
        loading={loadingAdminListingById}
        error={errorAdminListingById}
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
        status={adminListingById?.status || status}
      />
    </div>
  );
};

export default ListingApproval;
