import { Button, Modal, Spinner } from "react-bootstrap";
import { defaultImages, GCASH } from "../../../utils/consonants";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import { formatDate } from "../../../utils/dateFormat";
import RentalRateCalculator from "../common/RentalRateCalculator";
import { useState } from "react";

const ConfirmationModal = ({
  show,
  onHide,
  listing,
  confirm,
  selectedDate,
  selectedDuration,
}) => {
  const selectedDateId = listing.availableDates.find(
    (rentalDate) => rentalDate.date === selectedDate
  )?.id;

  const { total, rate, hrs } = RentalRateCalculator({
    pricePerHour: listing.rate,
    timeFrom: selectedDuration.timeFrom,
    timeTo: selectedDuration.timeTo,
  });
  const [isLoading, setIsLoading] = useState(false);

  const securityDeposit = parseFloat(listing.securityDeposit) || 0;
  const grandTotal = (parseFloat(total) || 0) + securityDeposit;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await confirm();
    } catch (error) {
      console.error("Error in confirmation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm rent transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="confirmation-modal">
          <div className="item-card">
            <div className="img-container">
              <img
                src={
                  listing.images && listing.images.length
                    ? listing.images[0]
                    : [defaultImages]
                }
                style={{ height: "100px", width: "100px" }}
                alt="Item image"
              />
            </div>
            <div className="item-desc">
              <span className="value">{listing.name}</span>
              <span className="value">₱ {listing.rate}</span>
              <span className="label">
                Item Condition:{" "}
                <span className="value">{listing.itemCondition}</span>
              </span>
            </div>
          </div>
          <div className="rental-desc">
            <span className="label">
              Delivery Method:{" "}
              <span className="value">{listing.deliveryMethod}</span>{" "}
            </span>
            <span className="label">
              Payment Method:{" "}
              <span className="value">
                {listing.paymentMethod === GCASH
                  ? "Online Payment"
                  : "Pay upon meetup"}
              </span>
            </span>

            <span className="label">
              Date: <span className="value">{formatDate(selectedDate)}</span>
            </span>
            <span className="label">
              Duration:
              <span className="value">
                {" "}
                {formatTimeTo12Hour(selectedDuration.timeFrom)} -{" "}
                {formatTimeTo12Hour(selectedDuration.timeTo)}
              </span>
            </span>
            <span className="label">
              Security Deposit:{" "}
              <span className="value">
                {listing.securityDeposit} (Refunded on return of item.)
              </span>
            </span>
            <span className="label">
              Total Rental Rate:{" "}
              <span className="value">
                ₱ {grandTotal} ({rate} x {hrs} + {listing.securityDeposit})
              </span>
            </span>
          </div>
          <div className="terms-condition">
            <span className="label">
              Late Charges: <span className="value">{listing.lateCharges}</span>
            </span>

            <span className="label">
              Repair and Replacement:{" "}
              <span className="value">{listing.repairReplacement}</span>
            </span>
          </div>
          <span>
            By confirming your rental, you agree to the platform's Policies,
            Terms and Conditions, and the terms with the other party ("Owner")
            (as shown above).
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={(e) => handleConfirm()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Processing...
            </>
          ) : (
            "Confirm"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
