import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useDispatch } from "react-redux";
import ShowAlert from "../../utils/ShowAlert";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51Qd6OGJyLaBvZZCyI1v3VC4nkJ4FnP3JqVkEeRlpth6sUUKxeaGVwsgpOKEUIiDI61ITMyzWvTYJUYshL6H4jfks00mNbCIiZP"
); // Replace with your actual key

// Payment Form Component
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Confirm the payment without capturing funds
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payment-success",
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // Payment was successful - show success message
        ShowAlert(
          dispatch,
          "success",
          "Payment Authorized",
          "Your payment has been authorized. The funds will be captured when your rental is complete."
        );
        navigate("/profile/transactions/renter/requests");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred.");
      console.error("Payment error:", error);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>Authorize Payment</h2>
      <p>
        Your payment will be authorized but not charged until your rental is
        complete.
      </p>

      <div className="payment-element-container">
        <PaymentElement />
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="payment-button"
      >
        {isLoading ? "Processing..." : "Authorize Payment"}
      </button>
    </form>
  );
};

// Main Payment Page Component
const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Get the client secret from localStorage
    const storedClientSecret = localStorage.getItem("stripeClientSecret");

    if (!storedClientSecret) {
      ShowAlert(dispatch, "error", "Error", "Payment information not found.");
      navigate("/");
      return;
    }

    setClientSecret(storedClientSecret);
  }, [navigate, dispatch]);

  if (!clientSecret) {
    return <div>Loading payment information...</div>;
  }

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;
