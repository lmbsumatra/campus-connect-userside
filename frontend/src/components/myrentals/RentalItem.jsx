import React, { useEffect, useMemo, useState } from "react";
import ReviewModal from "../User/modalReview/ReviewModal";
import "./MyRental.css";
import itemImage from "../../assets/images/item/item_1.jpg";
import { formatDate } from "../../utils/dateFormat";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import navigation
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
  const navigate = useNavigate(); // React Router navigation
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState(""); // "renter" or "owner"

  const dispatch = useDispatch(); // Redux dispatch

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmPayment = () => {
    setIsPaymentModalOpen(false);
    handleStatusUpdate("hand-over"); // Proceed to the next status after confirming payment
  };

  // Function to handle rental status update using Redux
  const handleStatusUpdate = async (action) => {
    try {
      let updatePayload = {
        rentalId: item.id,
        newStatus: action,
        userId: userId,
      };

      if (item.owner_id === userId) {
        updatePayload.ownerConfirmed = true;
      } else if (item.renter_id === userId) {
        updatePayload.renterConfirmed = true;
      }

      await dispatch(updateRentalStatus(updatePayload));

      // Now fetch the latest transactions
      await dispatch(fetchRentalTransactions(userId));

      // Emit update to socket
      const transactionData = {
        sender: userId,
        recipient: item.owner_id === userId ? item.renter_id : item.owner_id,
        rentalId: item.id,
        status: action,
      };

      // Only proceed if both users have confirmed
      const bothConfirmed =
        (item.owner_id === userId && item.renter_confirmed) ||
        (item.renter_id === userId && item.owner_confirmed);

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
      } else {
        let nextTab = "";
        switch (action) {
          case "accept":
            nextTab = "To Hand Over";
            break;
          default:
            nextTab = selectedTab;
        }

        onTabChange(nextTab);
      }

      socket.emit("update-transaction-status", transactionData);
    } catch (error) {
      console.error("Error updating rental status:", error);
    }
  };

  // Function to handle clicking "Message" button
  const handleMessageClick = async () => {
    try {
      const recipientId =
        item.owner_id === userId ? item.renter_id : item.owner_id;

      // Create or get existing conversation
      const response = await axios.post(
        "http://localhost:3001/api/conversations/createConversation",
        {
          senderId: userId,
          ownerId: recipientId,
        }
      );

      // Navigate to messages with conversation data
      navigate("/messages", {
        state: {
          ownerId: recipientId,
          product: {
            name: item.Listing.listing_name,
            status: item.status,
            image: itemImage,
          },
        },
      });
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
    }
  };

  // Define button configurations based on status
  const buttonConfig = useMemo(
    () => ({
      Requested: [
        ...(item.owner_id === userId
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
        ...(item.renter_id === userId
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
          onClick: handleMessageClick, // Use handleMessageClick function
          primary: false,
        },
      ],
      Accepted: [
        {
          label:
            item.owner_id === userId && item.owner_confirmed
              ? "Handed Over" // If Owner confirmed, show "Handed Over"
              : item.renter_id === userId && item.renter_confirmed
              ? "Received" // If Renter confirmed, show "Received"
              : item.owner_id === userId
              ? "Confirm Hand Over" // If Owner has not confirmed, show "Confirm Hand Over"
              : item.renter_id === userId
              ? "Confirm Item Receive" // If Renter has not confirmed, show "Confirm Hand Over"
              : "Confirm Hand Over", // Default fallback for any other situation
          onClick: () => handleStatusUpdate("hand-over"),
          onClick: () => {
            setIsPaymentModalOpen(true);
            setModalRole(item.owner_id === userId ? "owner" : "renter");
          },
          primary: true,
          disabled:
            item.is_allowed_to_proceed === false ||
            (item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed),
          disabledReason: (
            item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed
          )
            ? "Wait for the other party"
            : "Not yet allowed to proceed",
        },
        {
          label: "Message",
          onClick: handleMessageClick, // Use handleMessageClick function
          primary: false,
        },
      ],
      HandedOver: [
        {
          label:
            item.owner_id === userId && item.owner_confirmed
              ? "Received"
              : item.renter_id === userId && item.renter_confirmed
              ? "Returned"
              : item.owner_id === userId
              ? "Confirm Receive"
              : item.renter_id === userId
              ? "Confirm Return"
              : "Confirm Return",
          onClick: () => handleStatusUpdate("return"),
          primary: true,
          disabled:
            item.is_allowed_to_proceed === false ||
            (item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed),
          disabledReason:
            item.is_allowed_to_proceed === false
              ? "Not yet allowed to proceed"
              : "Wait for the other party",
        },
        {
          label: "Message",
          onClick: handleMessageClick, // Use handleMessageClick function
          primary: false,
        },
      ],
      Returned: [
        {
          label:
            (item.owner_id === userId && item.owner_confirmed) ||
            (item.renter_id === userId && item.renter_confirmed)
              ? "Completed"
              : "Complete",
          onClick: () => handleStatusUpdate("completed"),
          primary: true,
          disabled:
            item.is_allowed_to_proceed === false ||
            (item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed),
          disabledReason:
            item.is_allowed_to_proceed === false
              ? "Not yet allowed to proceed"
              : "Wait for the other party",
        },
        {
          label: "Message",
          onClick: handleMessageClick, // Use handleMessageClick function
          primary: false,
        },
      ],
      Completed: [
        {
          label:
            (item.owner_id === userId && item.owner_confirmed) ||
            (item.renter_id === userId && item.renter_confirmed)
              ? "Reviewed"
              : "Review",
          onClick: handleOpenModal,
          primary: true,
          disabled:
            item.is_allowed_to_proceed === false ||
            (item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed),
          disabledReason:
            item.is_allowed_to_proceed === false
              ? "Not yet allowed to proceed"
              : "Wait for the other party",
        },
      ],
      Reviewed: [],
      Cancelled: [],
    }),
    [userId, item.status, item.owner_confirmed, item.renter_confirmed]
  );

  // Define button color based on selected option (Owner or Renter)
  const getButtonColor = (primary) => {
    if (selectedOption === "Owner") {
      return primary ? "btn-owner-primary" : "btn-owner-secondary";
    } else if (selectedOption === "Renter") {
      return primary ? "btn-renter-primary" : "btn-renter-secondary";
    }
    return primary ? "btn-primary" : "btn-secondary";
  };

  return (
    <div className={`rental-item ${highlighted ? "highlighted" : ""}`}>
      <img src={itemImage} alt={item.title} className="rental-item-image" />
      <div className="rental-item-content">
        <h4>Item: {item.Listing.listing_name}</h4>
        {item.renter_id && (
          <p>
            Renter: {item.renter.first_name} {item.renter.last_name}
          </p>
        )}
        {item.owner_id && (
          <p>
            Owner: {item.owner.first_name} {item.owner.last_name}
          </p>
        )}
        {item.RentalDate && (
          <p>Request Date: {formatDate(item.RentalDate.date)}</p>
        )}
        <p>Status: {item.status}</p>

        <div className="action-buttons d-flex gap-2">
          {buttonConfig[item.status]?.map((button, index) =>
            button.primary && button.disabled ? ( // Show tooltip only for disabled primary buttons
              <Tooltip key={index} title={button.disabledReason} arrow>
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
