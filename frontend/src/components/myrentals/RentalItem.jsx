import React, { useEffect, useMemo, useState } from "react";
import ReviewModal from "../User/modalReview/ReviewModal";
import "./MyRental.css";
import itemImage from "../../assets/images/item/item_1.jpg";
import { formatDate } from "../../utils/dateFormat";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchRentalTransactions,
  updateRentalStatus,
} from "../../redux/transactions/rentalTransactionsSlice";
import axios from "axios";
import socket from "../../hooks/socket";
import { Tooltip } from "@mui/material";
import PaymentConfirmationModal from "./PaymentConfirmationModal";
import { baseApi } from "../../utils/consonants";
import ShowAlert from "../../utils/ShowAlert";

function RentalItem({
  item,
  onButtonClick,
  selectedOption,
  highlighted,
  selectedTab,
  onTabChange,
}) {
  console.log(item);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState("");
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStatusUpdate = async (action) => {
    if (!action) {
      await ShowAlert(
        dispatch,
        "warning",
        "Action Required",
        "Please select an action for the entity."
      );
      return;
    }
    try {
      let updatePayload = {
        rentalId: item.id,
        newStatus: action,
        userId: userId,
        transactionType: item.transactionType,
      };

      if (item.owner_id === userId) {
        updatePayload.ownerConfirmed = true;
      } else if (item.renter_id === userId || item.buyer_id === userId) {
        updatePayload.renterConfirmed = true;
      }

      const updateResult = await dispatch(updateRentalStatus(updatePayload));

      if (updateResult.error) {
        throw new Error(
          updateResult.error.message || "Failed to update transaction"
        );
      } else {
        await ShowAlert(
          dispatch,
          "success",
          "Success",
          `Transaction status successfully updated to ${action}.`
        );
      }
      await dispatch(fetchRentalTransactions(userId));

      const recipientId = (() => {
        const transaction = item.tx;
        const isRental = item.transactionType === "Rental";
        const isSell = item.transactionType === "Purchase";
        const isCurrentUserOwner = transaction.owner_id === userId;

        if (isRental) {
          return isCurrentUserOwner
            ? transaction.renter_id
            : transaction.owner_id;
        } else if (isSell) {
          return isCurrentUserOwner
            ? transaction.buyer_id
            : transaction.owner_id;
        } else {
          return transaction.owner_id;
        }
      })();

      const transactionData = {
        sender: userId,
        recipient: recipientId,
        rentalId: item.id,
        status: action,
      };

      socket.emit("update-transaction-status", transactionData);

      const bothConfirmed =
        (item.tx.owner_id === userId && item.tx.renter_confirmed) ||
        ((item.tx.renter_id === userId || item.tx.buyer_id === userId) &&
          item.tx.owner_confirmed);

      if (bothConfirmed) {
        let nextTab = "";
        switch (action) {
          case "accept":
            nextTab = "To Hand Over";
            break;
          case "hand-over":
            nextTab = "To Receive";
            break;
          case "return":
            nextTab = "Completed";
            break;
          case "completed":
            nextTab = "To Review";
            break;
          default:
            nextTab = selectedTab;
        }

        onTabChange(nextTab);
      } else if (item.tx.transaction_type === "sell") {
        let nextTab = "";
        switch (action) {
          case "hand-over":
            nextTab = "Completed";
            break;
        }
      } else {
        let nextTab = "";
        switch (action) {
          case "accept":
            nextTab = "To Hand Over";
            break;
          case "cancel":
            nextTab = "Cancelled";
            break;
          case "decline":
            nextTab = "Cancelled";
            break;
          default:
            nextTab = selectedTab;
        }

        onTabChange(nextTab);
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      await ShowAlert(
        dispatch,
        "error",
        "Action Failed",
        "Failed to update transaction"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageClick = async () => {
    try {
      const safeGetId = (obj, ...paths) => {
        for (const path of paths) {
          let value = obj;
          for (const key of path.split(".")) {
            value = value?.[key];
            if (value === undefined) break;
          }
          if (value) return value;
        }
        return undefined;
      };

      let recipientId;

      const ownerId = safeGetId(
        item,
        "owner_id",
        "tx.owner_id",
        "owner.id",
        "owner.user_id"
      );

      const renterId = safeGetId(
        item,
        "renter_id",
        "tx.renter_id",
        "renter.id",
        "renter.user_id"
      );

      const buyerId = safeGetId(
        item,
        "buyer_id",
        "tx.buyer_id",
        "buyer.id",
        "buyer.user_id"
      );

      const transactionType =
        safeGetId(item, "tx.transaction_type", "transactionType") ||
        (renterId ? "rental" : "sell");

      if (userId == ownerId) {
        recipientId =
          transactionType === "rental" || transactionType === "rent"
            ? renterId
            : buyerId;
      } else {
        recipientId = ownerId;
      }

      if (!recipientId) {
        const allParticipants = [ownerId, renterId, buyerId].filter(
          (id) => id && id != userId
        );
        recipientId = allParticipants[0];
      }

      if (!userId || !recipientId) {
        console.error("Missing required IDs:", { userId, recipientId });
        alert(
          "Cannot message: Missing recipient information. Please try again later."
        );
        return;
      }

      const senderId = String(userId);
      recipientId = String(recipientId);

      const itemName = getItemName();

      const itemImageUrl =
        item.item?.image_url ||
        item.Listing?.image_url ||
        item.tx?.image_url ||
        itemImage;

      const formattedStatus = item.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const response = await axios.post(
        `${baseApi}/api/conversations/createConversation`,
        {
          senderId: senderId,
          ownerId: recipientId,
        }
      );

      if (!response.data) {
        throw new Error("Failed to create conversation");
      }

      const conversationData = response.data;

      const displayTransactionType =
        transactionType === "rental" || transactionType === "rent"
          ? "Rental"
          : transactionType === "sell" || transactionType === "purchase"
          ? "Purchase"
          : "Transaction";

      navigate("/messages", {
        state: {
          activeConversationId: conversationData.id,
          product: {
            productId: item.id,
            name: itemName,
            price: item.tx?.price || item.price || item.tx?.rate || "N/A",
            image: itemImageUrl,
            title: "Inquiry",
            type: "rental-transaction",
            status: `Type: ${displayTransactionType}
Status: ${formattedStatus}
Item: ${itemName}`,
          },
        },
      });
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        alert(
          `Error: ${
            error.response.data.error || "Could not create conversation"
          }`
        );
      } else {
        alert("Could not connect to the message service");
      }
    }
  };

  const buttonConfig = useMemo(
    () => ({
      Requested: [
        ...(item.tx.owner_id === userId
          ? [
              {
                label: "Accept",
                onClick: () => handleStatusUpdate("accept"),
                primary: true,
              },
              {
                label: "Decline",
                onClick: () => handleStatusUpdate("decline"),
                primary: true,
              },
            ]
          : []),
        ...(item.tx.renter_id === userId || item.tx.buyer_id === userId
          ? [
              {
                label: "Cancel",
                onClick: () => handleStatusUpdate("cancel"),
                primary: true,
                disabled:
                  item.is_allowed_to_cancel === false ||
                  item.tx.owner_confirmed,
                disabledReason: item.tx.owner_confirmed
                  ? "Wait for the other party"
                  : "Not allowed to cancel",
              },
            ]
          : []),
        {
          label: "Message",
          onClick: handleMessageClick,
          primary: false,
        },
      ],
      Accepted: [
        ...(item.tx.renter_id === userId || item.tx.buyer_id === userId
          ? [
              {
                label: "Waiting for Owner's Confirmation",
                onClick: () => {},
                primary: true,
                disabled: true,
                disabledReason: "Please wait until the owner confirms.",
              },
              {
                label: "Cancel",
                onClick: () => handleStatusUpdate("cancel"),
                primary: true,
                disabled:
                  item.is_allowed_to_cancel === false ||
                  item.tx.owner_confirmed,
                disabledReason: item.tx.owner_confirmed
                  ? "Wait for the other party"
                  : "Not allowed to cancel",
              },
            ]
          : []),

        ...(item.tx.owner_id === userId
          ? [
              {
                label: item.tx.owner_confirmed
                  ? "Handed Over"
                  : "Confirm Hand Over",
                onClick: () => {
                  setIsPaymentModalOpen(true);
                  setModalRole("owner");
                },
                primary: true,
                disabled:
                  item.is_allowed_to_proceed === false ||
                  item.tx.owner_confirmed,
                disabledReason: item.tx.owner_confirmed
                  ? "Wait for the other party"
                  : "Not yet allowed to proceed",
              },
              {
                label: "Cancel",
                onClick: () => handleStatusUpdate("cancel"),
                primary: true,
                disabled:
                  item.is_allowed_to_cancel === false ||
                  item.tx.owner_confirmed,
                disabledReason: item.tx.owner_confirmed
                  ? "Wait for the other party"
                  : "Not allowed to cancel",
              },
            ]
          : []),
        {
          label: "Message",
          onClick: handleMessageClick,
          primary: false,
        },
      ],

      HandedOver: [
        ...(item.tx.renter_id === userId || item.tx.buyer_id === userId
          ? [
              {
                label: "Waiting for Owner's Confirmation",
                onClick: () => {},
                primary: true,
                disabled: true,
                disabledReason: "Please wait until the owner confirms.",
              },
            ]
          : []),

        ...(item.tx.owner_id === userId
          ? [
              {
                label: item.tx.owner_confirmed ? "Received" : "Confirm Receipt",
                onClick: () => {
                  if (item.transactionType === "Rental") {
                    setIsPaymentModalOpen(true);
                    setModalRole("owner");
                  } else {
                    handleStatusUpdate("completed");
                  }
                },
                primary: true,
                disabled:
                  item.is_allowed_to_proceed === false ||
                  item.tx.owner_confirmed,
                disabledReason:
                  item.is_allowed_to_proceed === false
                    ? "Not yet allowed to proceed"
                    : "Wait for the other party",
              },
            ]
          : []),
        {
          label: "Message",
          onClick: handleMessageClick,
          primary: false,
        },
      ],
      Returned: [
        ...(item.tx.renter_id === userId || item.tx.buyer_id === userId
          ? [
              {
                label: "Waiting for Owner's Confirmation",
                onClick: () => {},
                primary: true,
                disabled: true,
                disabledReason: "Please wait until the owner confirms.",
              },
            ]
          : []),

        ...(item.tx.owner_id === userId
          ? [
              {
                label: item.tx.owner_confirmed
                  ? "Completed"
                  : "Confirm Completion",
                onClick: () => {
                  handleStatusUpdate("completed");
                },
                primary: true,
                disabled:
                  item.is_allowed_to_proceed === false ||
                  item.tx.owner_confirmed,
                disabledReason:
                  item.is_allowed_to_proceed === false
                    ? "Not yet allowed to proceed"
                    : "Wait for the other party",
              },
            ]
          : []),
        {
          label: "Message",
          onClick: handleMessageClick,
          primary: false,
        },
      ],
      Completed: [
        {
          label:
            (item.tx.owner_id === userId && item.tx.owner_confirmed) ||
            ((item.tx.renter_id === userId || item.tx.buyer_id === userId) &&
              item.tx.renter_confirmed)
              ? "Reviewed"
              : "Review",
          onClick: handleOpenModal,
          primary: true,
          // disabled:
          //   item.is_allowed_to_proceed === false ||
          //   (item.tx.owner_id === userId
          //     ? item.tx.owner_confirmed
          //     : item.tx.renter_confirmed),
          // disabledReason:
          //   item.is_allowed_to_proceed === false
          //     ? "Not yet allowed to proceed"
          //     : "Wait for the other party",
        },
      ],
      Reviewed: [],
      Cancelled: [],
      Declined: [],
    }),
    [userId, item]
  );

  if (!item) {
    return <div className="rental-item">Invalid item data</div>;
  }

  const getButtonColor = (primary) => {
    if (selectedOption === "owner") {
      return primary ? "btn-owner-primary" : "btn-owner-secondary";
    } else if (selectedOption === "renter") {
      return primary ? "btn-renter-primary" : "btn-renter-secondary";
    } else if (selectedOption === "buyer") {
      return primary ? "btn-buyer-primary" : "btn-buyer-secondary";
    }
    return primary ? "btn-primary" : "btn-secondary";
  };

  const getItemName = () => {
    if (item.Listing && item.Listing.listing_name) {
      return item.Listing.listing_name;
    }

    if (item.item) {
      if (item.tx.transaction_type === "rental") {
        return (
          item.item.listing_name || item.item.name || item.item.title || ""
        );
      } else if (item.tx.transaction_type === "sell") {
        return (
          item.item.item_for_sale_name ||
          item.item.name ||
          item.item.title ||
          ""
        );
      }
    }

    if (item.itemName) {
      return item.itemName;
    }

    if (item.name) {
      return item.name;
    }

    if (item.tx && item.tx.item_name) {
      return item.tx.item_name;
    }

    return "Unknown Item";
  };

  const handleConfirmPayment = async (evidenceImage) => {
    setIsSubmitting(true);

    try {
      let actionType = null;

      if (
        item.transactionType === "Rental" &&
        item.tx.status === "HandedOver" &&
        (item.tx.owner.user_id === userId || item.tx.renter.user_id === userId)
      ) {
        if (evidenceImage && item.tx.owner.user_id === userId) {
          await uploadEvidenceImage(
            evidenceImage,
            item.id,
            "rental-return-evidence"
          );
        }
        actionType = "return";
      } else if (
        item.transactionType === "Purchase" &&
        item.tx.status === "Accepted" &&
        (item.tx.owner.user_id === userId || item.tx.buyer.user_id === userId)
      ) {
        if (evidenceImage && item.tx.owner.user_id === userId) {
          await uploadEvidenceImage(
            evidenceImage,
            item.id,
            "purchase-handover-evidence"
          );
        }
        actionType = "hand-over";
      } else if (
        item.transactionType === "Rental" &&
        item.tx.status === "Accepted" &&
        item.tx.owner.user_id === userId
      ) {
        if (evidenceImage) {
          await uploadEvidenceImage(
            evidenceImage,
            item.id,
            "rental-handover-evidence"
          );
        }
        actionType = "hand-over";
      }

      if (actionType) {
        handleStatusUpdate(actionType);

        await ShowAlert(
          dispatch,
          "success",
          "Success",
          `Transaction status successfully updated.`
        );
      } else {
        await ShowAlert(
          dispatch,
          "warning",
          "No Action Taken",
          "The current transaction state doesn't allow confirmation."
        );
      }
    } catch (error) {
      console.error("Error processing payment confirmation:", error);
      await ShowAlert(
        dispatch,
        "error",
        "Failed",
        "An error occurred while processing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadEvidenceImage = async (
    imageFile,
    transactionId,
    evidenceType
  ) => {
    try {
      const formData = new FormData();
      formData.append("transaction_evidence", imageFile);
      formData.append("transactionId", transactionId);
      formData.append("evidenceType", evidenceType);
      formData.append("userId", userId);

      const response = await axios.post(
        `${baseApi}/rental-transaction/upload-evidence`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading evidence:", error);
      throw error;
    }
  };

  return (
    <div className={`rental-item ${highlighted ? "highlighted" : ""}`}>
      <img
        src={item?.tx?.item?.images?.[0] || itemImage}
        alt={getItemName()}
        className="rental-item-image"
      />
      <div className="rental-item-content">
        <h4>Item: {getItemName()}</h4>
        <div
          style={{
            color: "white",
            backgroundColor: "teal",
            padding: " 4px 10px",
            borderRadius: "5px",
            display: "inline-block",
            whiteSpace: "nowrap",
            width: "fit-content",
          }}
        >
          Type: {item.transactionType || "rental"}
        </div>

        {item.tx.renter_id && item.tx.renter && (
          <p>
            Renter:{" "}
            {item.tx.renter_id === userId
              ? "You"
              : `${item.tx.renter.first_name} ${item.tx.renter.last_name}`}
          </p>
        )}
        {item.tx.buyer_id && item.tx.buyer && (
          <p>
            Buyer:{" "}
            {item.tx.buyer_id === userId
              ? "You"
              : `${item.tx.buyer.first_name} ${item.tx.buyer.last_name}`}
          </p>
        )}
        {item.tx.owner_id && item.tx.owner && (
          <p>
            Owner:{" "}
            {item.tx.owner_id === userId
              ? "You"
              : `${item.tx.owner.first_name} ${item.tx.owner.last_name}`}
          </p>
        )}
        {item.RentalDate && (
          <p>Request Date: {formatDate(item.RentalDate.date)}</p>
        )}

        {/* <p>Status: {item.status}</p> */}

        <div className="action-buttons d-flex gap-2">
          {buttonConfig[item.status]?.map((button, index) =>
            button.primary && button.disabled ? (
              <Tooltip key={index} title={button.disabledReason || ""} arrow>
                <span>
                  <button
                    className={`btn btn-rectangle ${getButtonColor(
                      button.primary
                    )}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onButtonClick(e);
                      button.onClick();
                    }}
                    disabled
                  >
                    {button.label}
                  </button>
                </span>
              </Tooltip>
            ) : (
              <button
                key={index}
                className={`btn btn-rectangle ${getButtonColor(
                  button.primary
                )}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick(e);
                  button.onClick();
                }}
                disabled={button.disabled}
              >
                {button.label}
              </button>
            )
          )}
        </div>
      </div>
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={item}
        selectedOption={selectedOption}
        userId={userId}
      />

      <PaymentConfirmationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleConfirmPayment}
        role={modalRole}
        paymentMode={item.paymentMethod}
        transactionType={item.transactionType}
        status={item.status}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default RentalItem;
