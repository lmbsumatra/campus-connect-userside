import React, { useEffect, useMemo, useState } from "react";
import ReviewModal from "../User/modalReview/ReviewModal";
import "./MyRental.css";
import itemImage from "../../assets/images/item/item_1.jpg";
import { formatDate } from "../../utils/dateFormat";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import navigation


function RentalItem({ item, onButtonClick, selectedOption }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // React Router navigation
  const { studentUser } = useAuth();
  const { userId } = studentUser;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // API call function
  const updateRentalStatus = async (action) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/rental-transaction/user/${item.id}/${action}`,
        { userId }
      );
    } catch (error) {
      console.error("Error updating rental status:", error);
    }
  };

    // Function to handle clicking "Message" button
        const handleMessageClick = async () => {
          try {
            const recipientId = item.owner_id === userId ? item.renter_id : item.owner_id;
            
            // Create or get existing conversation
            const response = await axios.post('http://localhost:3001/api/conversations/createConversation', {
              senderId: userId,
              ownerId: recipientId
            });
            
            // Navigate to messages with conversation data
            navigate("/messages", {
              state: {
                ownerId: recipientId,
                product: {
                  name: item.Listing.listing_name,
                  status: item.status,
                  image: itemImage,
                }
              }
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
                onClick: () => updateRentalStatus("accept"),
                primary: true,
              },
              {
                label: "Decline",
                onClick: () => updateRentalStatus("decline"),
                primary: true,
              },
            ]
          : []),
        ...(item.renter_id === userId
          ? [
              {
                label: "Cancel",
                onClick: () => updateRentalStatus("cancel"),
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
              ? "Received" // If Renter confirmed, show "Handed Over"
              : item.owner_id === userId
              ? "Confirm Hand Over" // If Owner has not confirmed, show "Confirm Hand Over"
              : item.renter_id === userId
              ? "Confirm Item Receive" // If Renter has not confirmed, show "Confirm Hand Over"
              : "Confirm Hand Over", // Default fallback for any other situation
          onClick: () => updateRentalStatus("hand-over"),
          primary: true,
          disabled:
            item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed,
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
          onClick: () => updateRentalStatus("return"),
          primary: true,
          disabled:
            item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed,
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
          onClick: () => updateRentalStatus("completed"),
          primary: true,
          disabled:
            item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed,
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
            item.owner_id === userId
              ? item.owner_confirmed
              : item.renter_confirmed,
        },
      ],
      Reviewed: [],
      Cancelled: [],
    }),

    [userId],
    console.log("Rental Item Page: check dependencies on fetch...")
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
    <div className="rental-item">
      <img src={itemImage} alt={item.title} className="rental-item-image" />
      <div className="rental-item-content">
        <h4>Item: {item.Listing.listing_name}</h4>
        {item.renter_id !== userId && (
          <p>
            Renter: {item.renter.first_name} {item.renter.last_name}
          </p>
        )}
        {item.owner_id !== userId && (
          <p>
            Owner: {item.owner.first_name} {item.owner.last_name}
          </p>
        )}
        {item.RentalDate && (
          <p>Request Date: {formatDate(item.RentalDate.date)}</p>
        )}
        {item.handoverDate && <p>Handover Date: {item.handoverDate}</p>}
        {item.returnDate && <p>Return Date: {item.returnDate}</p>}
        {item.rentalPeriod && <p>Rental Period: {item.rentalPeriod}</p>}
        {item.cancellation && <p>Cancellation Date: {item.cancellation}</p>}
        {item.location && <p>Location: {item.location}</p>}
        {item.reason && <p>Reason: {item.reason}</p>}
        <p>Status: {item.status}</p>

        <div className="action-buttons d-flex gap-2">
          {buttonConfig[item.status]?.map((button, index) => (
            <>
              <button
                key={index}
                className={`btn btn-rectangle ${getButtonColor(
                  button.primary
                )} `}
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick(e); // Prevent outer click
                  button.onClick(); // Call button's onClick function
                }}
                disabled={button.disabled}
              >
                {button.label}
              </button>
            </>
          ))}
        </div>
      </div>
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={item}
        selectedOption={selectedOption}
        userId={userId}
      />
    </div>
  );
}

export default RentalItem;
