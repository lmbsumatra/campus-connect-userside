import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const BuySlotPage = ({ clientSecret }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const {
    listingType = "",
    token = "",
    userId = "",
    paymentIntentId = "",
  } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payment-success",
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          // Call your backend to update the student's slot
          const response = await axios.post(
            `${baseApi}/api/buy-slot/`,
            {
              paymentIntentId,
              userId,
              listingType,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data) {
            ShowAlert(
              dispatch,
              "success",
              "Payment Successful",
              "Your payment for an extra item slot has been completed."
            );
            // After success, navigate and remove location state
            navigate("/profile/my-listings/add", { state: null });
          } else {
            setErrorMessage("Payment succeeded but slot update failed.");
          }
        } catch (apiError) {
          console.error("Error updating slot:", apiError);
          setErrorMessage("Payment succeeded but failed to update your slot.");
        }
      } else {
        setErrorMessage("Payment failed or not confirmed.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        <h2>Buy Extra Slot</h2>
        <p>You're about to purchase an additional item slot for ₱10.</p>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="payment-element-container">
            <PaymentElement />
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="payment-button"
          >
            {isLoading ? "Processing..." : "Buy Extra Slot"}
          </button>
        </form>
      </div>
    </div>
  );
};

const BuySlotPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();


  if (!location.state) {
    navigate("/");
    return null; 
  }

  const { paymentIntentId, listingType, token, clientSecret, userId } =
    location.state;

  if (!paymentIntentId || !listingType || !token || !clientSecret) {
 
    navigate("/");
    return null; 
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <BuySlotPage clientSecret={clientSecret} />
    </Elements>
  );
};

export default BuySlotPageWrapper;
