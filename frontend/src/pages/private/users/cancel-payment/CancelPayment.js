import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTimeWithAMPM } from "../../../../utils/dateFormat";
import "./cancelPaymentStyles.css";
import stripeIcon from "./stripe.svg";

const CancelPayment = () => {
  const dateTime = new Date();
  const navigate = useNavigate();

  useEffect(() => {
    // Replace history state to remove previous entry
    window.history.replaceState(null, "", window.location.href);

    // Push a new dummy state to prevent back navigation
    setTimeout(() => {
      window.history.pushState(null, "", window.location.href);
    }, 100);

    const handleBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
      navigate("/", { replace: true }); // Redirect user to home page
    };

    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, [navigate]);

  return (
    <div className="cancel-payment-container">
      <div className="wrapper">
        <div className="transaction-header">
          <h3 className="title  text-center">
            Payment & Rental Transaction Cancelled
          </h3>
          <p className="subtitle">
            Your payment has been successfully canceled, and your rental
            transaction has been withdrawn. You can review your rentals anytime
            under My Rentals.
          </p>
        </div>

        <div className="date-holder">
          <span className="context">Date </span>
          <span>{formatDate(dateTime)}</span>
        </div>

        <div className="time-holder">
          <span className="context">Time </span>
          <span>{formatTimeWithAMPM(dateTime)}</span>
        </div>

        <div className="action-btns">
          <button
            className="btn btn-rectangle secondary"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
          <button
            className="btn btn-rectangle primary"
            onClick={() => navigate("/profile/transactions/renter/requests")}
          >
            View My Rentals
          </button>
        </div>

        <p className="subtitle text-center">
          If something went wrong, feel free to contact us:
          rentupeers.team@tup.edu.ph
        </p>
      </div>
    </div>
  );
};

export default CancelPayment;
