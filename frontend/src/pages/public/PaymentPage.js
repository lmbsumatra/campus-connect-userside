import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import "./paymentPageStyles.css";
import { baseApi } from "../../utils/consonants";

const stripePromise = loadStripe(
  "pk_test_51Qd6OGJyLaBvZZCyI1v3VC4nkJ4FnP3JqVkEeRlpth6sUUKxeaGVwsgpOKEUIiDI61ITMyzWvTYJUYshL6H4jfks00mNbCIiZP"
);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
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
        ShowAlert(
          dispatch,
          "success",
          "Payment Authorized",
          "Your payment has been authorized. The funds will be captured when your rental is complete."
        );
        localStorage.removeItem("paymentData");
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

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isCancelLoading, setCancelLoading] = useState(false);

  const stateData =
    location.state || JSON.parse(localStorage.getItem("paymentData"));

  const { paymentIntentId, clientSecretFromState, rentalId, userId } =
    stateData || {};

  useEffect(() => {
    if (clientSecretFromState) {
      setClientSecret(clientSecretFromState);
      localStorage.setItem(
        "paymentData",
        JSON.stringify({
          paymentIntentId,
          clientSecretFromState,
          rentalId,
          userId,
        })
      );
    } else if (!clientSecretFromState) {
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "You do not have access to this page"
      );
      navigate("/");
    }
  }, [clientSecretFromState, navigate, dispatch]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handleBack = async () => {
      if (window.confirm("Do you want to cancel the payment?")) {
        setCancelLoading(true);
        ShowAlert(dispatch, "loading", "Canceling Payment");

        try {
          await axios.post(
            `${baseApi}/rental-transaction/user/${rentalId}/cancel`,
            { userId }
          );
          localStorage.removeItem("paymentData");
          ShowAlert(
            dispatch,
            "success",
            "Payment Cancelled",
            "Your payment has been cancelled successfully."
          );
          navigate("/payment-cancelled");
        } catch (error) {
          ShowAlert(dispatch, "error", "Error", "Failed to cancel payment.");
        } finally {
          setCancelLoading(false);
        }
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handleBack);
    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate, rentalId, userId]);

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
