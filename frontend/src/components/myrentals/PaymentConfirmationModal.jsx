import React, { useState, useRef } from "react";
import { Button, Modal, Form } from "react-bootstrap";

const PaymentConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  role,
  paymentMode,
  transactionType,
  status,
}) => {
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size exceeds 5MB limit");
        return;
      }
      if (!file.type.match("image.*")) {
        setUploadError("Please select an image file");
        return;
      }

      setEvidenceImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const evidenceRequired = shouldRequireEvidence();
    if (evidenceRequired && !evidenceImage) {
      setUploadError("Please upload evidence image to proceed");
      return;
    }

    onConfirm(evidenceImage);
  };

  const shouldRequireEvidence = () => {
    if (
      transactionType === "Purchase" &&
      status === "Accepted" &&
      role === "owner"
    ) {
      return true;
    } else if (transactionType === "Rental") {
      if (status === "Accepted" && role === "owner") return true;
      if (status === "HandedOver" && role === "owner") return true;
    }
    return false;
  };

  const getEvidenceInstructions = () => {
    if (
      transactionType === "Purchase" &&
      status === "Accepted" &&
      role === "owner"
    ) {
      return "Please upload a photo showing the item has been handed over to the buyer.";
    } else if (transactionType === "Rental") {
      if (status === "Accepted" && role === "owner") {
        return "Please upload a photo showing the item has been handed over to the renter.";
      } else if (status === "HandedOver" && role === "owner") {
        return "Please upload a photo showing the item has been returned by the renter.";
      }
    }
    return "";
  };

  const getModalTitle = () => {
    if (transactionType === "Purchase") {
      return role === "buyer" ? "Confirm Purchase" : "Confirm Sale";
    } else {
      return role === "renter"
        ? "Confirm Rental Payment"
        : "Confirm Rental Receipt";
    }
  };

  const getModalText = () => {
    const isGcash = paymentMode === "GCASH";
    const isPurchase = transactionType === "Purchase";
    const transactionName = isPurchase ? "purchase" : "rental";

    const gcashInstructions = {
      owner: "Please check your account for pending payouts. ",
      buyer:
        "Please ensure that you have sent the payment via Online Payment. ",
      renter:
        "Please ensure that you have sent the payment via Online Payment. ",
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
        if (isGcash) {
          return status === "HandedOver"
            ? `The payment for this ${transactionName} will be processed through Stripe and will be sent to your account after confirming. If the renter has been consistently late, you may collect applicable late charges.`
            : `Once confirmed, the payment for this ${transactionName} will be processed through Stripe.`;
        } else {
          return `Have you received the ${transactionName} payment upon meetup? Confirming this means you acknowledge receiving it.`;
        }

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
      centered
      onClick={(e) => e.stopPropagation()}
    >
      <Modal.Header closeButton>
        <Modal.Title>{getModalTitle()}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <p>{getModalText()}</p>

          {shouldRequireEvidence() && (
            <div className="evidence-upload-section mt-3">
              <Form.Group>
                <Form.Label>
                  <strong>Evidence Required</strong>
                </Form.Label>
                <p className="text-muted small">{getEvidenceInstructions()}</p>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />

                {/* Clickable container */}
                <div
                  className="evidence-preview-container"
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  style={{
                    border: "2px dashed #ccc",
                    borderRadius: "10px",
                    padding: "1rem",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Evidence preview"
                      // className="img-thumbnail"
                      style={{ maxHeight: "200px" }}
                    />
                  ) : (
                    <span className="text-muted">
                      Click here to upload evidence image
                    </span>
                  )}
                </div>

                {uploadError && (
                  <p className="text-danger small mt-2">{uploadError}</p>
                )}
              </Form.Group>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {getButtonText()}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PaymentConfirmationModal;
