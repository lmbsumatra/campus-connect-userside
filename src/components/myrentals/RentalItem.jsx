// src/components/MyRentals/RentalItem.js
import React, { useState } from "react";
import ReviewModal from "../modalReview/ReviewModal";
import "./MyRental.css";

function RentalItem({ item }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="rental-item">
      <img src={item.image} alt={item.title} className="rental-item-image" />
      <div className="rental-item-content">
        <h3>{item.title}</h3>
        {item.borrower && <p>Borrower: {item.borrower}</p>}
        {item.lender && <p>Lender: {item.lender}</p>}
        {item.requestDate && <p>Request Date: {item.requestDate}</p>}
        {item.handoverDate && <p>Handover Date: {item.handoverDate}</p>}
        {item.returnDate && <p>Return Date: {item.returnDate}</p>}
        {item.rentalPeriod && <p>Rental Period: {item.rentalPeriod}</p>}
        {item.cancellation && <p>Cancellation Date: {item.cancellation}</p>}
        {item.location && <p>Location: {item.location}</p>}
        {item.reason && <p>Reason: {item.reason}</p>}
        <p>Status: {item.status}</p>

        <div className="action-buttons">
          {item.status === "Pending" ? (
            <>
              <button className="btn btn-primary filled">
                <span className="text-gradient">Accept</span>
              </button>
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Decline</span>
              </button>
            </>
          ) : item.status === "Hand Over" ? (
            <>
              <button className="btn btn-primary filled">
                <span className="text-gradient">{item.borrower ? "Handed" : "Received"}</span> 
              </button>
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Message</span>
              </button>
            </>
          ) : item.status === "Return" ? (
            <>
              <button className="btn btn-primary filled">
                <span className="text-gradient">{item.borrower ? "Return" : "Confirmed Returned"}</span>
              </button>
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Message</span>
              </button>
            </>
          ) : item.status === "Completed" ? (
            <>
              <button className="btn btn-primary filled" onClick={handleOpenModal}>
                <span className="text-gradient">Review</span>
              </button>
            </>
          ) : item.status === "Reviewed" ? (
            <></>
          ) : item.status === "Cancelled" ? (
            <></>
          ) : null}
        </div>
      </div>
      <ReviewModal isOpen={isModalOpen} onClose={handleCloseModal} item={item} />
    </div>
  );
}

export default RentalItem;
