import { Button, Modal } from "react-bootstrap";
import { defaultImages } from "../../../utils/consonants";
import { formatTimeTo12Hour } from "../../../utils/timeFormat";
import { formatDate } from "../../../utils/dateFormat";

const ConfirmationModal = ({
  show,
  onHide,
  itemforsale,
  confirm,
  selectedDate,
  selectedDuration,
}) => {
  console.log(itemforsale, selectedDate);

  const selectedDateId = itemforsale.rentalDates.find(
    (rentalDate) => rentalDate.date === selectedDate
  )?.id;

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
                  itemforsale.images && itemforsale.images.length
                    ? itemforsale.images[0]
                    : [defaultImages]
                }
                style={{ height: "100px", width: "100px" }}
                alt="Item image"
              />
            </div>
            <div className="item-desc">
              <span className="value">{itemforsale.name}</span>
              <span className="value">{itemforsale.rate}</span>
              <span className="label">
                Item Condition:{" "}
                <span className="value">{itemforsale.itemCondition}</span>
              </span>
            </div>
          </div>
          <div className="rental-desc">
            <span className="label">
              Delivery Method:{" "}
              <span className="value">{itemforsale.deliveryMethod}</span>{" "}
            </span>
            <span className="label">
              Payment Method:{" "}
              <span className="value">{itemforsale.paymentMethod}</span>
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
          </div>
          {/* <div className="terms-condition">
            <span className="label">
              Late Charges:{" "}
              <span className="value">{itemforsale.lateCharges}</span>
            </span>
            <span className="label">
              Security Deposit:{" "}
              <span className="value">{itemforsale.securityDeposit}</span>
            </span>
            <span className="label">
              Repair and Replacement:{" "}
              <span className="value">{itemforsale.repairReplacement}</span>
            </span>
          </div> */}
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
        <Button variant="primary" onClick={(e) => confirm()}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
