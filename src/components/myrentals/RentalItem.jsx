import React, { useState } from "react";
import ReviewModal from "../modalReview/ReviewModal";
import "./MyRental.css";
import itemImage from "../../assets/images/item/item_1.jpg";
import { formatDate } from "../../utils/dateFormat";
import axios from "axios"; // Make sure axios is installed
import { useAuth } from "../../context/AuthContext";

function RentalItem({ item, onButtonClick }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { studentUser } = useAuth(); // Replace this with the actual user ID from your auth context or props
  const { userId } = studentUser;
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // API call function
  console.log(item.owner_id);
  const updateRentalStatus = async (action) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/rental-transaction/user/${item.id}/${action}`,
        { userId }
      );

      console.log(response.data);
      // Optionally update the local state to reflect changes
      // For example, you can use a state management solution or pass a function to update the parent's state
    } catch (error) {
      console.error("Error updating rental status:", error);
    }
  };

  // Define button configurations based on status
  const buttonConfig = {
    Requested: [
      // Buttons for the owner
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
      // Button for the renter
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
        onClick: () => console.log("Message Sent"),
        primary: false,
      },
    ],
    Accepted: [
      {
        label:
          item.owner_id === userId && item.owner_confirmed
            ? "Confirm Hand Over"
            : item.renter_id === userId && item.renter_confirmed
            ? "Confirm Hand Over"
            : "Hand Over",
        onClick: () => updateRentalStatus("hand-over"),
        primary: true,
        disabled:
          item.owner_id === userId
            ? item.owner_confirmed
            : item.renter_confirmed,
      },
      {
        label: "Message",
        onClick: () => console.log("Message Sent"),
        primary: false,
      },
    ],
    HandedOver: [
      {
        label:
          (item.owner_id === userId && item.owner_confirmed) ||
          (item.renter_id === userId && item.renter_confirmed)
            ? "Confirmed Return"
            : "Return",
        onClick: () => updateRentalStatus("return"),
        primary: true,
        disabled:
          item.owner_id === userId
            ? item.owner_confirmed
            : item.renter_confirmed,
      },
      {
        label: "Message",
        onClick: () => console.log("Message Sent"),
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
        onClick: () => console.log("Message Sent"),
        primary: false,
      },
    ],
    Completed: [{ label: "Review", onClick: handleOpenModal, primary: true }],
    Reviewed: [],
    Cancelled: [],
  };

  return (
    <div className="rental-item">
      <img src={itemImage} alt={item.title} className="rental-item-image" />
      <div className="rental-item-content">
        <h3>Item: {item.Listing.listing_name}</h3>
        {item.renter && (
          <p>
            Renter: {item.renter.first_name} {item.renter.last_name}
          </p>
        )}
        {item.owner && (
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

        <div className="action-buttons">
          {buttonConfig[item.status]?.map((button, index) => (
            <button
              key={index}
              className={`btn btn-rectangle ${
                button.primary ? "primary" : "secondary"
              }`}
              onClick={(e) => {
                onButtonClick(e); // Prevent outer click
                button.onClick(); // Call button's onClick function
              }}

              disabled={button.disabled}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={item}
      />
    </div>
  );
}

export default RentalItem;
