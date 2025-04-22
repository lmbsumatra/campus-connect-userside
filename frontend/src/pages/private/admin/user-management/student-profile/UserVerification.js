import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import FetchUserInfoForAdmin from "../../../../../utils/FetchUserInfoAdmin";
import { Modal, Button } from "react-bootstrap";
import { useAuth } from "../../../../../context/AuthContext";
import "./userVerification.css";
import { baseApi } from "../../../../../utils/consonants";
import { useDispatch } from "react-redux";
import ShowAlert from "../../../../../utils/ShowAlert";

const UserVerification = () => {
  const { adminUser } = useAuth();
  const { id } = useParams();
  const { user, student, loading, errorMessage } = FetchUserInfoForAdmin(id);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("verified");
  const [statusMessage, setStatusMessage] = useState("");
  const dispatch = useDispatch();

  console.log({ user, student });

  // Update selectedStatus when student data loads
  useEffect(() => {
    if (student?.status) {
      setSelectedStatus(student.status);
      setStatusMessage(student.statusMessage || ""); // Pre-fill message if exists
    }
  }, [student]);

  const [postSlots, setPostSlots] = useState(0);
  const [itemSlots, setItemSlots] = useState(0);
  const [listingSlots, setListingSlots] = useState(0);
  const [isUpdatingSlots, setIsUpdatingSlots] = useState(false);
  const [slotUpdated, setSlotUpdated] = useState(false);
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    slotType: "",
  });
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  const SLOT_PRICE = 10;
  const FREE_TIER_LIMIT = 3;

  useEffect(() => {
    if (student) {
      setPostSlots(
        Math.max(FREE_TIER_LIMIT, user.post_slot || FREE_TIER_LIMIT)
      );
      setItemSlots(
        Math.max(FREE_TIER_LIMIT, user.item_slot || FREE_TIER_LIMIT)
      );
      setListingSlots(
        Math.max(FREE_TIER_LIMIT, user.listing_slot || FREE_TIER_LIMIT)
      );
    }
  }, [student]);

  const [slotsChanged, setSlotsChanged] = useState(false);

  useEffect(() => {
    if (student) {
      setPostSlots(
        Math.max(FREE_TIER_LIMIT, user.post_slot || FREE_TIER_LIMIT)
      );
      setItemSlots(
        Math.max(FREE_TIER_LIMIT, user.item_slot || FREE_TIER_LIMIT)
      );
      setListingSlots(
        Math.max(FREE_TIER_LIMIT, user.listing_slot || FREE_TIER_LIMIT)
      );

      setSlotsChanged(false);
    }
  }, [student]);

  const handleConfirmUpdate = () => {
    const paymentAmount = calculatePaymentAmount();

    if (paymentAmount > 0) {
      setPaymentDetails({
        amount: paymentAmount,
        postSlotsDiff: Math.max(
          0,
          postSlots - (user?.post_slot || FREE_TIER_LIMIT)
        ),
        itemSlotsDiff: Math.max(
          0,
          itemSlots - (user?.item_slot || FREE_TIER_LIMIT)
        ),
        listingSlotsDiff: Math.max(
          0,
          listingSlots - (user?.listing_slot || FREE_TIER_LIMIT)
        ),
      });
      setShowPaymentConfirmModal(true);
    } else {
      handleUpdateSlots();
    }
  };

  const calculatePaymentAmount = () => {
    if (!student) return 0;

    const originalPostPaid = Math.max(
      0,
      (user.post_slot || FREE_TIER_LIMIT) - FREE_TIER_LIMIT
    );
    const originalItemPaid = Math.max(
      0,
      (user.item_slot || FREE_TIER_LIMIT) - FREE_TIER_LIMIT
    );
    const originalListingPaid = Math.max(
      0,
      (user.listing_slot || FREE_TIER_LIMIT) - FREE_TIER_LIMIT
    );

    const newPostPaid = Math.max(0, postSlots - FREE_TIER_LIMIT);
    const newItemPaid = Math.max(0, itemSlots - FREE_TIER_LIMIT);
    const newListingPaid = Math.max(0, listingSlots - FREE_TIER_LIMIT);

    const postDiff = newPostPaid - originalPostPaid;
    const itemDiff = newItemPaid - originalItemPaid;
    const listingDiff = newListingPaid - originalListingPaid;

    const totalPayment =
      (Math.max(0, postDiff) +
        Math.max(0, itemDiff) +
        Math.max(0, listingDiff)) *
      SLOT_PRICE;

    return totalPayment;
  };

  const handleUpdateSlots = async () => {
    setIsUpdatingSlots(true);
    setShowPaymentConfirmModal(false);

    try {
      const response = await fetch(`${baseApi}/admin/update-student-slots`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({
          studentId: student.id,
          post_slot: postSlots,
          item_slot: itemSlots,
          listing_slot: listingSlots,
          payment_collected: calculatePaymentAmount() > 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update slots");
      }

      await ShowAlert(
        dispatch,
        "success",
        "Slots Updated",
        "User slot counts updated successfully!",
        {
          text: "Refresh Page",
          action: () => window.location.reload(),
        }
      );
      setSlotUpdated(true);
    } catch (error) {
      console.error("Error updating slots:", error);
      await ShowAlert(
        dispatch,
        "error",
        "Update Failed",
        `Failed to update slots: ${error.message}`
      );
    } finally {
      setIsUpdatingSlots(false);
    }
  };

  const adjustPostSlots = (amount) => {
    const newValue = Math.max(FREE_TIER_LIMIT, postSlots + amount);
    setPostSlots(newValue);
    if (newValue !== (user?.post_slot || FREE_TIER_LIMIT)) {
      setSlotsChanged(true);
    } else {
      const itemAtOriginal = itemSlots === (user?.item_slot || FREE_TIER_LIMIT);
      const listingAtOriginal =
        listingSlots === (user?.listing_slot || FREE_TIER_LIMIT);
      if (itemAtOriginal && listingAtOriginal) {
        setSlotsChanged(false);
      }
    }
  };

  const adjustItemSlots = (amount) => {
    const newValue = Math.max(FREE_TIER_LIMIT, itemSlots + amount);
    setItemSlots(newValue);
    if (newValue !== (user.item_slot || FREE_TIER_LIMIT)) {
      setSlotsChanged(true);
    } else {
      const postAtOriginal = postSlots === (user?.post_slot || FREE_TIER_LIMIT);
      const listingAtOriginal =
        listingSlots === (user?.listing_slot || FREE_TIER_LIMIT);
      if (postAtOriginal && listingAtOriginal) {
        setSlotsChanged(false);
      }
    }
  };

  const adjustListingSlots = (amount) => {
    const newValue = Math.max(FREE_TIER_LIMIT, listingSlots + amount);
    setListingSlots(newValue);
    if (newValue !== (user?.listing_slot || FREE_TIER_LIMIT)) {
      setSlotsChanged(true);
    } else {
      const postAtOriginal = postSlots === (user?.post_slot || FREE_TIER_LIMIT);
      const itemAtOriginal = itemSlots === (user?.item_slot || FREE_TIER_LIMIT);
      if (postAtOriginal && itemAtOriginal) {
        setSlotsChanged(false);
      }
    }
  };

  const handleImageClick = (imageSrc) => {
    setPreviewImage(imageSrc);
  };

  const handleVerifyStudent = async () => {
    if (
      ["flagged", "banned", "restricted"].includes(selectedStatus) &&
      !statusMessage.trim()
    ) {
      await ShowAlert(
        dispatch,
        "warning",
        "Action Required",
        `Please provide a reason/feedback for setting the status to ${selectedStatus}.`
      );
      return;
    }

    try {
      const response = await fetch(`${baseApi}/admin/change-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({
          studentId: student.id,
          status: selectedStatus,
          statusMessage: statusMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update student status");
      }

      await ShowAlert(
        dispatch,
        "success",
        "Status Updated",
        "Student status updated successfully!",
        {
          text: "Refresh Page",
          action: () => window.location.reload(),
        }
      );
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating student status:", error);
      await ShowAlert(
        dispatch,
        "error",
        "Update Failed",
        `Failed to update student status: ${error.message}`
      );
    }
  };

  // Get badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "verified":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "flagged":
        return "badge-danger";
      case "banned":
        return "badge-dark";

      case "restricted":
        return "badge-info";

      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="verification-container">
      {loading ? (
        <div className="loading-spinner text-center">
          {" "}
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading user data...</p>
        </div>
      ) : errorMessage ? (
        <div className="error-message alert alert-danger">
          {" "}
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
          {errorMessage}
        </div>
      ) : user && student ? (
        <>
          <div className="verification-header">
            <h2>Student Verification</h2>
            <div className="header-actions">
              <span
                className={`status-badge ${getStatusBadgeClass(
                  student.status
                )}`}
              >
                {" "}
                {student.status}
              </span>
              <button
                className="btn-verify ms-2"
                type="button"
                onClick={() => setShowModal(true)}
              >
                {" "}
                Change Status
              </button>
            </div>
          </div>

          <div className="verification-content">
            {/* User Profile Card */}
            <div className="user-profile-card">
              <div className="profile-header">
                <h3>User Information</h3>
              </div>
              <div className="profile-body">
                <div className="profile-item">
                  <span className="profile-label">Full Name</span>
                  <span className="profile-value">
                    {user.fname} {user.mname} {user.lname}
                  </span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Email Verified</span>
                  <span className="profile-value">
                    <span
                      className={`verification-badge ${
                        user.emailVerified ? "verified" : "unverified"
                      }`}
                    >
                      {user.emailVerified ? "Yes" : "No"}
                    </span>
                  </span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Join Date</span>
                  <span className="profile-value">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Information Card */}
            <div className="user-profile-card">
              <div className="profile-header">
                <h3>Student Information</h3>
              </div>
              <div className="profile-body">
                <div className="profile-item">
                  <span className="profile-label">TUP ID</span>
                  <span className="profile-value">{student.tupId}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">College</span>
                  <span className="profile-value">{student.college}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Course</span>
                  <span className="profile-value">{student.course}</span>
                </div>
                {student.statusMessage && (
                  <div className="profile-item">
                    <span className="profile-label">Status Reason</span>
                    <span className="profile-value status-message">
                      {student.statusMessage}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Documents */}
            <div className="verification-documents">
              <h3>Verification Documents</h3>
              <div className="documents-grid">
                {/* Profile Pic */}
                {student.profilePic && (
                  <div className="document-card">
                    <h4>Profile Picture</h4>
                    <div className="document-image-container">
                      <img
                        src={student.profilePic}
                        alt="Profile"
                        onClick={() => handleImageClick(student.profilePic)}
                      />
                      <div className="image-overlay">
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Scanned ID */}
                {student.scannedId && (
                  <div className="document-card">
                    <h4>Scanned ID</h4>
                    <div className="document-image-container">
                      <img
                        src={student.scannedId}
                        alt="Scanned ID"
                        onClick={() => handleImageClick(student.scannedId)}
                      />
                      <div className="image-overlay">
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Photo with ID */}
                {student.photoWithId && (
                  <div className="document-card">
                    <h4>Photo with ID</h4>
                    <div className="document-image-container">
                      <img
                        src={student.photoWithId}
                        alt="Student ID verification"
                        onClick={() => handleImageClick(student.photoWithId)}
                      />
                      <div className="image-overlay">
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Handle case where no documents are available */}
                {!student.profilePic &&
                  !student.scannedId &&
                  !student.photoWithId && (
                    <p className="text-muted">
                      No verification documents submitted.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Fallback if user/student data couldn't be loaded but no specific error message
        <div className="error-message alert alert-warning">
          Could not load user or student details.
        </div>
      )}

      <div className="user-profile-card">
        <div className="profile-header">
          <h3>Items and Posts Slot Management</h3>
          {slotUpdated && <span className="badge bg-success">Updated</span>}
        </div>
        <div className="profile-body">
          {/* Free Tier Info */}
          <div className="alert alert-secondary mb-3">
            <i className="bi bi-info-circle-fill me-2"></i>
            Free tier includes {FREE_TIER_LIMIT} slots for each type. Additional
            slots cost ₱{SLOT_PRICE} each.
          </div>

          {/* Post Slot Management */}
          <div className="profile-item mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="profile-label">
                  Post Looking For Item Slots
                </span>
                {postSlots > FREE_TIER_LIMIT && (
                  <small className="text-muted ms-2">
                    ({FREE_TIER_LIMIT} free + {postSlots - FREE_TIER_LIMIT}{" "}
                    paid)
                  </small>
                )}
              </div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => adjustPostSlots(-1)}
                  disabled={postSlots <= FREE_TIER_LIMIT || isUpdatingSlots}
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-dash"></i>
                </button>

                <span className="mx-3 fw-bold">{postSlots}</span>

                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => adjustPostSlots(1)}
                  disabled={isUpdatingSlots}
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Item Slot Management */}
          <div className="profile-item mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="profile-label">Item For Sale Slots</span>
                {itemSlots > FREE_TIER_LIMIT && (
                  <small className="text-muted ms-2">
                    ({FREE_TIER_LIMIT} free + {itemSlots - FREE_TIER_LIMIT}{" "}
                    paid)
                  </small>
                )}
              </div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => adjustItemSlots(-1)}
                  disabled={itemSlots <= FREE_TIER_LIMIT || isUpdatingSlots}
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-dash"></i>
                </button>

                <span className="mx-3 fw-bold">{itemSlots}</span>

                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => adjustItemSlots(1)}
                  disabled={isUpdatingSlots}
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Listing Slot Management */}
          <div className="profile-item mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="profile-label">Listing For Rent Slots</span>
                {listingSlots > FREE_TIER_LIMIT && (
                  <small className="text-muted ms-2">
                    ({FREE_TIER_LIMIT} free + {listingSlots - FREE_TIER_LIMIT}{" "}
                    paid)
                  </small>
                )}
              </div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => adjustListingSlots(-1)}
                  disabled={listingSlots <= FREE_TIER_LIMIT || isUpdatingSlots}
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-dash"></i>
                </button>

                <span className="mx-3 fw-bold">{listingSlots}</span>

                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => adjustListingSlots(1)}
                  disabled={isUpdatingSlots}
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Total Slots Summary */}
          <div className="alert alert-info mt-3">
            <div className="d-flex justify-content-between">
              <div>
                <strong>Total Slots: </strong>{" "}
                {postSlots + itemSlots + listingSlots}
              </div>
              {calculatePaymentAmount() > 0 && (
                <div>
                  <strong>Payment Required: </strong> ₱
                  {calculatePaymentAmount()}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={handleConfirmUpdate}
              disabled={isUpdatingSlots}
            >
              {isUpdatingSlots ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating Slots...
                </>
              ) : (
                "Save Slot Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <Modal
        show={showPaymentConfirmModal}
        onHide={() => setShowPaymentConfirmModal(false)}
        centered
        className="payment-confirm-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Payment Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Please ensure that you have collected payment before proceeding.
          </div>

          <div className="payment-details">
            <h5>Payment Details:</h5>
            <table className="table table-borderless">
              <tbody>
                {paymentDetails.postSlotsDiff > 0 && (
                  <tr>
                    <td>Post Looking For Item:</td>
                    <td>+{paymentDetails.postSlotsDiff} slots</td>
                    <td>₱{paymentDetails.postSlotsDiff * SLOT_PRICE}</td>
                  </tr>
                )}
                {paymentDetails.itemSlotsDiff > 0 && (
                  <tr>
                    <td>Item For Sale:</td>
                    <td>+{paymentDetails.itemSlotsDiff} slots</td>
                    <td>₱{paymentDetails.itemSlotsDiff * SLOT_PRICE}</td>
                  </tr>
                )}
                {paymentDetails.listingSlotsDiff > 0 && (
                  <tr>
                    <td>Listing For Rent:</td>
                    <td>+{paymentDetails.listingSlotsDiff} slots</td>
                    <td>₱{paymentDetails.listingSlotsDiff * SLOT_PRICE}</td>
                  </tr>
                )}
                <tr className="fw-bold">
                  <td colSpan="2">Total:</td>
                  <td>₱{paymentDetails.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="form-check mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="paymentCollected"
              required
              checked={isPaymentConfirmed}
              onChange={(e) => setIsPaymentConfirmed(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="paymentCollected">
              I confirm that payment of ₱{paymentDetails.amount} has been
              collected from the user.
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowPaymentConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            id="confirmPaymentBtn"
            variant="success"
            onClick={handleUpdateSlots}
            disabled={!isPaymentConfirmed}
          >
            Confirm & Update Slots
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verification Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="verification-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Student Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Select a new status and provide a reason/feedback (required for
            Flagged, Banned, Restricted):
          </p>
          <div className="status-selector">
            <div className="form-group mb-3">
              {" "}
              <label htmlFor="statusSelect" className="form-label">
                Status
              </label>{" "}
              <select
                id="statusSelect"
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
                <option value="banned">Banned</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="statusMessage" className="form-label">
                Status Reason/Feedback:
              </label>{" "}
              <textarea
                className="form-control"
                id="statusMessage"
                rows="3"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder={
                  selectedStatus === "verified"
                    ? "Account meets verification requirements."
                    : selectedStatus === "pending"
                    ? "Account needs further review or document submission."
                    : selectedStatus === "flagged"
                    ? "Reason for flagging (e.g., unclear documents, suspicious activity)."
                    : selectedStatus === "banned"
                    ? "Reason for permanent ban (e.g., policy violation, fraud)."
                    : selectedStatus === "restricted"
                    ? "Reason for temporary restriction (Note: Expiry set via reports)."
                    : ""
                }
                required={["flagged", "banned", "restricted"].includes(
                  selectedStatus
                )}
              ></textarea>
              {["flagged", "banned", "restricted"].includes(selectedStatus) &&
                !statusMessage.trim() && (
                  <small className="text-danger">
                    Reason is required for this status.
                  </small>
                )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            className={`status-change-btn ${selectedStatus}`}
            onClick={handleVerifyStudent}
          >
            Confirm Change
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        show={!!previewImage}
        onHide={() => setPreviewImage(null)}
        centered
        size="lg"
        className="image-preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewImage && (
            <div className="preview-image-container">
              <img src={previewImage} alt="Enlarged View" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setPreviewImage(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserVerification;
