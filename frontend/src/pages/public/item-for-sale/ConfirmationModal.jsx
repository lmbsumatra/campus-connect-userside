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
  quantity,
}) => {
  const selectedDateId = itemforsale.rentalDates.find(
    (rentalDate) => rentalDate.date === selectedDate
  )?.id;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Purchase</Modal.Title>
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
              <span className="value">₱ {itemforsale.price}</span>
              <span className="label">
                Quantity:
                <span className="value">{quantity || "1"}</span>
              </span>

              <span className="label">
                Item Condition:
                <span className="value">{itemforsale.itemCondition}</span>
              </span>
            </div>
          </div>
          <div className="rental-desc">
            <span className="label">
              Total:{" "}
              <span className="value">
                ₱ {itemforsale.price * quantity} ({itemforsale.price} x{" "}
                {quantity})
              </span>
            </span>
            <span className="label">
              Delivery Method:{" "}
              <span className="value">{itemforsale.deliveryMethod}</span>{" "}
            </span>
            <span className="label">
              Payment Method:{" "}
              <span className="value">
                {itemforsale.paymentMethod === "gcash"
                  ? "Online Payment"
                  : "Pay upon meetup"}
              </span>
            </span>

            <span className="label">
              Date: <span className="value">{formatDate(selectedDate)}</span>
            </span>
            <span className="label">
              Pickup Time:
              <span className="value">
                {" "}
                {formatTimeTo12Hour(selectedDuration.timeFrom)} -{" "}
                {formatTimeTo12Hour(selectedDuration.timeTo)}
              </span>
            </span>
            <span className="label">
              Location will be revealed after owner accepted the request.
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
        <Button variant="primary" onClick={(e) => confirm()}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
