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
  // console.log(item);
  const handleConfirmPayment = () => {
    if (
      item.transactionType === "Rental" &&
      item.tx.status === "HandedOver" &&
      (item.tx.owner.user_id === userId || item.tx.renter.user_id === userId)
    ) {
      // console.log("rent");
      // setIsPaymentModalOpen(false);
      handleStatusUpdate("return");
    } else if (
      item.transactionType === "Purchase" &&
      item.tx.status === "Accepted" &&
      (item.tx.owner.user_id === userId || item.tx.buyer.user_id === userId)
    ) {
      // console.log("buy");
      // setIsPaymentModalOpen(false);
      handleStatusUpdate("hand-over");
    }
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
      // console.error("Error updating transaction status:", error);
    }
  };

  const handleMessageClick = async () => {
    try {
      // Debug the complete item structure to see all properties
      console.log("Complete item structure:", JSON.stringify(item, null, 2));
      
      // Debug the transaction structure
      console.log("Transaction item structure:", {
        item_id: item.id,
        owner_id: item.owner_id,
        tx: item.tx,
        userId: userId,
        renter_id: item.renter_id,
        buyer_id: item.buyer_id
      });

      // Safer extraction of IDs from possibly nested structures
      const safeGetId = (obj, ...paths) => {
        for (const path of paths) {
          let value = obj;
          for (const key of path.split('.')) {
            value = value?.[key];
            if (value === undefined) break;
          }
          if (value) return value;
        }
        return undefined;
      };

      // Handle possibility of missing owner_id or transaction type
      let recipientId;
      
      // Get owner ID from all possible locations
      const ownerId = safeGetId(
        item, 
        'owner_id', 
        'tx.owner_id', 
        'owner.id', 
        'owner.user_id'
      );
      
      // Get renter ID from all possible locations
      const renterId = safeGetId(
        item, 
        'renter_id', 
        'tx.renter_id', 
        'renter.id', 
        'renter.user_id'
      );
      
      // Get buyer ID from all possible locations  
      const buyerId = safeGetId(
        item, 
        'buyer_id', 
        'tx.buyer_id', 
        'buyer.id', 
        'buyer.user_id'
      );

      console.log("Extracted IDs:", { ownerId, renterId, buyerId, userId });

      // Determine transaction type with fallbacks
      const transactionType = safeGetId(item, 'tx.transaction_type', 'transactionType') || 
                             (renterId ? 'rental' : 'sell');
      
      // Determine recipient based on user role
      if (userId == ownerId) {
        // Current user is the owner
        recipientId = transactionType === 'rental' || transactionType === 'rent' 
                     ? renterId 
                     : buyerId;
      } else {
        // Current user is renter/buyer
        recipientId = ownerId;
      }

      // If still undefined, try any non-userId participant
      if (!recipientId) {
        const allParticipants = [ownerId, renterId, buyerId].filter(id => id && id != userId);
        recipientId = allParticipants[0];
      }

      // Check if we have valid IDs
      console.log("User IDs for conversation:", { senderId: userId, recipientId });

      if (!userId || !recipientId) {
        console.error("Missing required IDs:", { userId, recipientId });
        alert("Cannot message: Missing recipient information. Please try again later.");
        return;
      }

      // Ensure IDs are strings
      const senderId = String(userId);
      recipientId = String(recipientId);

      // Get item name from various possible sources
      const itemName = getItemName();
      
      // Get item image
      const itemImageUrl = item.item?.image_url || 
                           item.Listing?.image_url || 
                           item.tx?.image_url || 
                           itemImage;

      // Format status for display
      const formattedStatus = item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      console.log("Making API request to create conversation:", {
        senderId,
        recipientId,
      });

      const response = await axios.post(
        "http://localhost:3001/api/conversations/createConversation",
        {
          senderId: senderId,
          ownerId: recipientId,
        }
      );

      console.log("API response:", response.data);

      if (!response.data) {
        throw new Error("Failed to create conversation");
      }

      const conversationData = response.data;

      // Determine transaction type for display text
      const displayTransactionType = 
        (transactionType === 'rental' || transactionType === 'rent') ? "Rental" : 
        (transactionType === 'sell' || transactionType === 'purchase') ? "Purchase" : 
        "Transaction";

      // Navigate to messages with properly formatted product details
      navigate("/messages", {
        state: {
          activeConversationId: conversationData.id,
          product: {
            productId: item.id,
            name: itemName,
            price: item.tx?.price || item.price || item.tx?.rate || "N/A",
            image: itemImageUrl,
            title: "Inquiry", // This ensures it shows as "Inquiring about this item"
            type: "rental-transaction", // Custom type for navigation
            status: `Type: ${displayTransactionType}
Status: ${formattedStatus}
Item: ${itemName}`
          }
        }
      });
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        alert(`Error: ${error.response.data.error || 'Could not create conversation'}`);
      } else {
        alert("Could not connect to the message service");
      }
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
            if (item.transactionType === "Purchase") {
              setIsPaymentModalOpen(true);
            } else {
              handleStatusUpdate("hand-over");
            }

            setModalRole(
              item.tx.owner_id === userId
                ? "owner"
                : item.tx.transaction_type === "rental"
                ? "renter"
                : "buyer"
            );
          },
          primary: true,
          //  item.tx.is_allowed_to_proceed === false
          disabled:
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
            setModalRole(
              item.tx.owner_id === userId
                ? "owner"
                : item.tx.transaction_type === "rental"
                ? "renter"
                : "buyer"
            );
            if (item.transactionType === "Sell") {
            } else if (item.transactionType === "Rental") {
              setIsPaymentModalOpen(true);
            }
          },
          primary: true,
          //  item.tx.is_allowed_to_proceed === false
          disabled:
            item.is_allowed_to_proceed === false ||
            (item.tx.owner_id === userId
              ? item.tx.owner_confirmed
              : item.tx.renter_confirmed),
          //  item.tx.is_allowed_to_proceed === false
          disabledReason:
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
          onClick: () => {
            handleStatusUpdate("completed");
          },
          primary: true,
          //  item.tx.is_allowed_to_proceed === false
          disabled:
            item.is_allowed_to_proceed === false ||
            (item.tx.owner_id === userId
              ? item.tx.owner_confirmed
              : item.tx.renter_confirmed),
          //  item.tx.is_allowed_to_proceed === false
          disabledReason:
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
    // Check all possible places where the item name could be stored
    if (item.Listing && item.Listing.listing_name) {
      return item.Listing.listing_name;
    } 
    
    if (item.item) {
      // Try different property names for rental items
      if (item.tx.transaction_type === "rental") {
        return item.item.listing_name || item.item.name || item.item.title || '';
      } 
      // Try different property names for sale items
      else if (item.tx.transaction_type === "sell") {
        return item.item.item_for_sale_name || item.item.name || item.item.title || '';
      }
    }
    
    // Check additional possible locations
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
        paymentMode={item.paymentMethod}
        transactionType={item.transactionType}
      />
    </div>
  );
}

export default RentalItem;
