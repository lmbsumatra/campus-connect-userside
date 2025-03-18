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

function RentalItem({
  item,
  onButtonClick,
  selectedOption,
  highlighted,
  selectedTab,
  onTabChange,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState("");
  const dispatch = useDispatch();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmPayment = () => {
    setIsPaymentModalOpen(false);
    handleStatusUpdate("hand-over");
  };

  const handleStatusUpdate = async (action) => {
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

      await dispatch(updateRentalStatus(updatePayload));
      await dispatch(fetchRentalTransactions(userId));

      const recipientId = (() => {
        const transaction = item.tx;
        const isRental = item.transactionType === "Rental";
        const isSell = item.transactionType === "Purchase";
        const isCurrentUserOwner = transaction.owner_id === userId;

        if (isRental) {
          // For rental transactions
          return isCurrentUserOwner
            ? transaction.renter_id
            : transaction.owner_id;
        } else if (isSell) {
          // For purchase/sale transactions
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
    }
  };

  const handleMessageClick = async () => {
    try {
      const recipientId =
        item.owner_id === userId
          ? item.tx.transaction_type === "rental"
            ? item.renter_id
            : item.buyer_id
          : item.owner_id;

      const response = await axios.post(
        "http://localhost:3001/api/conversations/createConversation",
        {
          senderId: userId,
          ownerId: recipientId,
        }
      );

      // Determine item name based on what fields are available
      let itemName = "";
      if (item.item) {
        if (item.tx.transaction_type === "rental" && item.item.listing_name) {
          itemName = item.item.listing_name;
        } else if (
          item.tx.transaction_type === "sell" &&
          item.item.item_for_sale_name
        ) {
          itemName = item.item.item_for_sale_name;
        }
      }
      // Try to get item name from different fields in case the structure is different
      else if (item.Listing && item.Listing.listing_name) {
        itemName = item.Listing.listing_name;
      } else if (item.itemName) {
        itemName = item.itemName;
      }

      navigate("/messages", {
        state: {
          ownerId: recipientId,
          product: {
            name: itemName || "Unknown Item",
            status: item.status,
            image: itemImage,
          },
        },
      });
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
    }
  };

  // Define button configurations based on status and transaction type
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
        {
          label:
            item.tx.owner_id === userId && item.tx.owner_confirmed
              ? "Handed Over"
              : (item.tx.renter_id === userId || item.tx.buyer_id === userId) &&
                item.tx.renter_confirmed
              ? "Received"
              : item.tx.owner_id === userId
              ? "Confirm Hand Over"
              : item.tx.renter_id === userId || item.tx.buyer_id === userId
              ? "Confirm Item Receive"
              : "Confirm Hand Over",

          onClick: () => {
            handleStatusUpdate("hand-over");
            setModalRole(
              item.tx.owner_id === userId
                ? "owner"
                : item.tx.transaction_type === "rental"
                ? "renter"
                : "buyer"
            );
          },
          primary: true,
          disabled: //  item.tx.is_allowed_to_proceed === false
            item.is_allowed_to_proceed === false ||
            (item.tx.owner_id === userId
              ? item.tx.owner_confirmed
              : item.tx.renter_confirmed),
          disabledReason: (
            item.tx.owner_id === userId
              ? item.tx.owner_confirmed
              : item.tx.renter_confirmed
          )
            ? "Wait for the other party"
            : "Not yet allowed to proceed",
        },
        {
          label: "Message",
          onClick: handleMessageClick,
          primary: false,
        },
      ],
      HandedOver: [
        {
          label:
            item.tx.owner_id === userId && item.tx.owner_confirmed
              ? "Received"
              : (item.tx.renter_id === userId || item.tx.buyer_id === userId) &&
                item.tx.renter_confirmed
              ? item.tx.transaction_type === "rental" // <== Enforce return only for rentals
                ? "Returned"
                : "Confirm Return"
              : item.tx.owner_id === userId
              ? "Confirm Receive"
              : item.tx.renter_id === userId || item.tx.buyer_id === userId
              ? item.tx.transaction_type === "rental"
                ? "Confirm Return"
                : "Confirm Completion"
              : "Confirm Return",
          onClick: () => {
            setIsPaymentModalOpen(true);
            handleStatusUpdate(
              item.tx.transaction_type === "rental" ? "return" : ""
            );
          },
          primary: true,
          disabled: //  item.tx.is_allowed_to_proceed === false
            item.is_allowed_to_proceed === false ||
            (item.tx.owner_id === userId
              ? item.tx.owner_confirmed
              : item.tx.renter_confirmed),
          disabledReason: //  item.tx.is_allowed_to_proceed === false
            item.is_allowed_to_proceed === false
              ? "Not yet allowed to proceed"
              : "Wait for the other party",
        },
        {
          label: "Message",
          onClick: handleMessageClick,
          primary: false,
        },
      ],
      Returned: [
        {
          label:
            (item.tx.owner_id === userId && item.tx.owner_confirmed) ||
            ((item.tx.renter_id === userId || item.tx.buyer_id === userId) &&
              item.tx.renter_confirmed)
              ? "Completed"
              : "Confirm Completion",
          onClick: () => handleStatusUpdate("completed"),
          primary: true,
          disabled: //  item.tx.is_allowed_to_proceed === false
            item.is_allowed_to_proceed === false ||
            (item.tx.owner_id === userId
              ? item.tx.owner_confirmed
              : item.tx.renter_confirmed),
          disabledReason: //  item.tx.is_allowed_to_proceed === false
            item.is_allowed_to_proceed === false
              ? "Not yet allowed to proceed"
              : "Wait for the other party",
        },
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
          disabled:
            item.is_allowed_to_proceed === false ||
            (item.tx.owner_id === userId
              ? item.tx.owner_confirmed
              : item.tx.renter_confirmed),
          disabledReason:
            item.is_allowed_to_proceed === false
              ? "Not yet allowed to proceed"
              : "Wait for the other party",
        },
      ],
      Reviewed: [],
      Cancelled: [],
      Declined: [],
    }),
    [userId, item]
  );

  // Safeguard against invalid item - moved after hooks
  if (!item) {
    return <div className="rental-item">Invalid item data</div>;
  }

  // Define button color based on selected option (Owner or Renter)
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
    } else if (item.item) {
      if (item.tx.transaction_type === "rental" && item.item.listing_name) {
        return item.item.listing_name;
      } else if (
        item.tx.transaction_type === "sell" &&
        item.item.item_for_sale_name
      ) {
        return item.item.item_for_sale_name;
      }
    } else if (item.itemName) {
      return item.itemName;
    }
    return "Unknown Item";
  };

  return (
    <div className={`rental-item ${highlighted ? "highlighted" : ""}`}>
      <img src={itemImage} alt={getItemName()} className="rental-item-image" />
      <div className="rental-item-content">
        <h4>Item: {getItemName()}</h4>
        {item.renter_id && item.renter && (
          <p>
            Renter: {item.renter.first_name} {item.renter.last_name}
          </p>
        )}
        {item.buyer_id && item.buyer && (
          <p>
            Buyer: {item.buyer.first_name} {item.buyer.last_name}
          </p>
        )}
        {item.owner_id && item.owner && (
          <p>
            Owner: {item.owner.first_name} {item.owner.last_name}
          </p>
        )}
        {item.RentalDate && (
          <p>Request Date: {formatDate(item.RentalDate.date)}</p>
        )}
        <p className="indx">Type: {item.transactionType || "rental"}</p>
        <p>Status: {item.status}</p>

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
      />
    </div>
  );
}

export default RentalItem;
