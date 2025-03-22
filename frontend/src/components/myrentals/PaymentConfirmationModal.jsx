import React from "react";
import { Button, Modal } from "react-bootstrap";

const PaymentConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  role,
  paymentMode,
  transactionType,
}) => {

  const getModalTitle = () => {
    if (transactionType === "Purchase") {
      return role === "buyer" ? "Confirm Purchase" : "Confirm Sale";
    } else {
      // Rental
      return role === "renter"
        ? "Confirm Rental Payment"
        : "Confirm Rental Receipt";
    }
  };

  const getModalText = () => {
    const isGcash = paymentMode === "GCASH";
    const isPurchase = transactionType === "Purchase";
    const transactionName = isPurchase ? "purchase" : "rental";

    // Payment method specific instructions
    const gcashInstructions = {
      owner: "Please check your account for pending payouts. ",
      buyer: "Please ensure that you have sent the payment via Online Payment. ",
      renter: "Please ensure that you have sent the payment via Online Payment. ",
    };

    const meetupInstructions = {
      owner: "Please ensure that you have collected the payment. ",
      buyer: "Please ensure that you have handed over the payment. ",
      renter: "Please ensure that you have handed over the payment. ",
    };

    const instructions = isGcash
      ? gcashInstructions[role]
      : meetupInstructions[role] || "";

    switch (role) {
      case "renter":
        return `Are you sure you want to send the rental payment to the owner ${
          isGcash ? "via Online Payment" : "upon meetup"
        }? ${instructions}`;
      case "owner":
        return `Have you received the ${transactionName} payment ${
          isGcash ? "via Online Payment" : "upon meetup"
        }? ${instructions}Confirming this means you acknowledge receiving it.`;
      case "buyer":
        return `Are you sure you want to complete this ${transactionName} ${
          isGcash ? "via Online Payment" : "upon meetup"
        }? ${instructions}`;
      default:
        return `Are you sure you want to proceed with this ${transactionName} payment ${
          isGcash ? "via Online Payment" : "upon meetup"
        }?`;
    }
  };

  const getButtonText = () => {
    const isGcash = paymentMode === "GCASH";
    const isPurchase = transactionType === "Purchase";

    switch (role) {
      case "renter":
        return isGcash ? "Send GCash Payment" : "Confirm Rental Payment";
      case "owner":
        return isPurchase ? "Confirm Sale Receipt" : "Confirm Rental Receipt";
      case "buyer":
        return isGcash
          ? `Complete Online Payment ${isPurchase ? "Purchase" : "Rental"}`
          : `Complete ${isPurchase ? "Purchase" : "Rental"}`;
      default:
        return isGcash ? "Send Online Payment" : "Confirm Payment";
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      center
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{getModalTitle()}</h2>
        <p>{getModalText()}</p>
        <div className="">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentConfirmationModal;
