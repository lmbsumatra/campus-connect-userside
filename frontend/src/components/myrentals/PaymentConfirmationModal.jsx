import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

const PaymentConfirmationModal = ({ isOpen, onClose, onConfirm, role }) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      center
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{role === "renter" ? "Confirm Payment" : "Confirm Receipt"}</h2>
        <p>
          {role === "renter"
            ? "Are you sure you want to send the payment to the owner? This can be online or upon meetup."
            : "Have you received the payment? Confirming this means you acknowledge receiving it."}
        </p>
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
            {role === "renter" ? "Send Payment" : "Confirm Receipt"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentConfirmationModal;
