import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";
import "./PaymentConfirmation.css";

const PaymentConfirmation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Extract payment details from location state or query params
  const queryParams = new URLSearchParams(location.search);
  const paymentId =
    location.state?.paymentIntentId || queryParams.get("payment_id");
  const rentalId = location.state?.rentalId || queryParams.get("rental_id");

  useEffect(() => {
    // Simulate checking payment status with backend
    const checkPaymentStatus = async () => {
      try {
        // In a real app, this would be an API call to your backend
        // const response = await axios.get(`/api/payment/status/${paymentId}`);

        // Simulate API response
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulating successful payment
        setPaymentStatus("success");

        dispatch(
          showNotification({
            type: "success",
            title: "Payment Successful",
            text: "Your payment has been processed successfully.",
          })
        );
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPaymentStatus("failed");

        dispatch(
          showNotification({
            type: "error",
            title: "Payment Error",
            text: "There was an issue processing your payment. Please try again.",
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (paymentId) {
      checkPaymentStatus();
    } else {
      setIsLoading(false);
      setPaymentStatus("invalid");
    }
  }, [paymentId, dispatch]);

  const handleGoToTransactions = () => {
    navigate("/profile/transactions/renter/requests");
  };

  const handleTryAgain = () => {
    // Redirect back to the payment page or checkout
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Container className="payment-confirmation">
        <div className="loading-container">
          <Spinner animation="border" role="status" variant="primary" />
          <p>Processing your payment...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="payment-confirmation">
      <Card className="payment-card">
        <Card.Body>
          <div className={`status-icon ${paymentStatus}`}>
            {paymentStatus === "success" && (
              <i className="fas fa-check-circle"></i>
            )}
            {paymentStatus === "failed" && (
              <i className="fas fa-times-circle"></i>
            )}
            {paymentStatus === "invalid" && (
              <i className="fas fa-exclamation-circle"></i>
            )}
          </div>

          <Card.Title>
            {paymentStatus === "success" && "Payment Successful!"}
            {paymentStatus === "failed" && "Payment Failed"}
            {paymentStatus === "invalid" && "Invalid Payment Request"}
          </Card.Title>

          {paymentStatus === "success" && (
            <>
              <Alert variant="success">
                Your payment has been processed successfully. The seller has
                been notified.
              </Alert>

              <div className="transaction-details">
                <p>
                  <strong>Transaction ID:</strong> {paymentId || "N/A"}
                </p>
                <p>
                  <strong>Rental ID:</strong> {rentalId || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong> {new Date().toLocaleString()}
                </p>
              </div>

              <div className="action-buttons">
                <Button variant="primary" onClick={handleGoToTransactions}>
                  View My Transactions
                </Button>
              </div>
            </>
          )}

          {paymentStatus === "failed" && (
            <>
              <Alert variant="danger">
                There was an issue processing your payment. No charges have been
                made to your account.
              </Alert>

              <div className="action-buttons">
                <Button variant="primary" onClick={handleTryAgain}>
                  Try Again
                </Button>
                <Button variant="secondary" onClick={() => navigate("/browse")}>
                  Continue Shopping
                </Button>
              </div>
            </>
          )}

          {paymentStatus === "invalid" && (
            <>
              <Alert variant="warning">
                The payment request is invalid or has expired.
              </Alert>

              <div className="action-buttons">
                <Button variant="primary" onClick={() => navigate("/browse")}>
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentConfirmation;
