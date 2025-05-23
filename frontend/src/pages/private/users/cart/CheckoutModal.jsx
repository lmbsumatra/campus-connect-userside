import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";
import { fetchCart } from "../../../../redux/cart/cartSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./checkoutModalStyles.css";
import { Tooltip } from "@mui/material";
import { baseApi, baseUrl, GCASH } from "../../../../utils/consonants.js";
import RentalRateCalculator from "../../../public/common/RentalRateCalculator.jsx";

const CheckoutModal = ({ show, onHide, items }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [stripePaymentDetails, setStripePaymentDetails] = useState(null);
  const selectedItem = items.length === 1 ? items[0] : null;
  const [paymentMethod, setPaymentMethod] = useState(
    selectedItem?.paymentMode || null
  );

  const { total, rate, hrs } = RentalRateCalculator({
    pricePerHour: selectedItem?.price,
    timeFrom: selectedItem?.rentalTimeFrom,
    timeTo: selectedItem?.rentalTimeTo,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const studentUser = JSON.parse(localStorage.getItem("studentUser"));
      const loggedInUserId = studentUser?.userId || null;

      if (!loggedInUserId) {
        throw new Error("User not logged in");
      }

      const rentalDetails = {
        owner_id: selectedItem.owner.id,
        [selectedItem.itemType === "buy" ? "buyer_id" : "renter_id"]:
          loggedInUserId,
        item_id: selectedItem.itemId,
        delivery_method: selectedItem.deliveryMethod || "meetup", 
        date_id: selectedItem.dateId,
        time_id: selectedItem.durationId,
        payment_mode: selectedItem?.paymentMode || paymentMethod,
        isFromCart: true,
        transaction_type: selectedItem.itemType === "buy" ? "sell" : "rental",
        amount: selectedItem.itemType === "buy" ? selectedItem.price : total,
        quantity: selectedItem.quantity
      };

      const response = await axios.post(
        `${baseApi}/rental-transaction/add`,
        rentalDetails
      );

      if (selectedItem?.paymentMode === GCASH) {
        if (!response.data.clientSecret || !response.data.paymentIntentId) {
          dispatch(
            showNotification({
              type: "error",
              title: "Error",
              text: "Failed to setup payment.",
            })
          );
          return;
        }

        const paymentDetails = {
          paymentIntentId: response.data.paymentIntentId,
          clientSecretFromState: response.data.clientSecret,
          rentalId: response.data.id,
          userId: loggedInUserId,
        };

        setStripePaymentDetails(paymentDetails);

        onHide();
        navigate("/payment", { state: paymentDetails });
      } else {
        dispatch(
          showNotification({
            type: "success",
            title: "Success!",
            text: "Your order has been placed successfully.",
          })
        );

        dispatch(fetchCart());
        onHide();
        navigate("/profile/transactions/renter/requests");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text:
            error.message ||
            "There was an error processing your order. Please try again.",
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Checkout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedItem ? (
          <Form onSubmit={handleSubmit}>
            <div className="checkout-section">
              <h4>Checkout Summary</h4>
              <div className="owner-section">
                <h5>
                  Owner: {selectedItem.owner.fname} {selectedItem.owner.lname}
                </h5>
                <div className="checkout-item">
                  <div className="item-info d-flex align-items-center">
                    <span className="item-name">{selectedItem.name}</span>
                    <span className="item-type">{selectedItem.itemType}</span>
                  </div>
                  <div className="item-price">₱{selectedItem.price}</div>
                </div>
                {selectedItem.itemType === "rent" && (
                  <>
                    <div className="checkout-item">
                      <div className="item-info">
                        <span className="item-name">Duration</span>
                      </div>
                      <div className="item-price">x {hrs}</div>
                    </div>
                    <div className="checkout-item">
                      <div className="item-info">
                        <span className="item-name">Security Deposit</span>
                      </div>
                      <div className="item-price">
                        + {selectedItem?.securityDeposit}
                      </div>
                    </div>
                    <div className="checkout-item">
                      <div className="item-info">
                        <span className="item-name">Total</span>
                      </div>
                      <div className="item-price">
                        ₱
                        {(
                          Number(total) +
                          Number(selectedItem?.securityDeposit || 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="checkout-section">
              <h4>Payment Method</h4>
              <Tooltip
                arrow
                title={
                  selectedItem.paymentMode
                    ? "Payment method has been pre-selected by owner"
                    : ""
                }
              >
              
                <div>{selectedItem?.paymentMode === GCASH ? "Online Payment" : "Pay upon meetup"}</div>
              </Tooltip>
            </div>

            <div className="checkout-section">
              <h4>Confirmation</h4>
              <p>
                By placing this order, you agree to our{" "}
                <a href={`${baseUrl}/terms-and-condition`}>Terms and Condition</a> and acknowledge that you have
                read our <a href={`${baseUrl}/privacy-policy`}>Privacy Policy</a>.
              </p>
            </div>

            <Modal.Footer>
              <Button variant="secondary" onClick={onHide}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </Modal.Footer>
          </Form>
        ) : (
          <p>No item selected for checkout.</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CheckoutModal;
