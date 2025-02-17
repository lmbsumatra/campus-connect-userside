import { useEffect } from "react";
import { formatDate, formatTimeWithAMPM } from "../../../../utils/dateFormat";
import "./successPaymentStyles.css";
import stripeIcon from "./stripe.svg";

const SuccessPayment = () => {
  const dateTime = new Date();

  useEffect(() => {
    const handleRedirectToTransactionPage = () => {};
    handleRedirectToTransactionPage();
  });

  return (
    <div className="success-payment-container">
      <div className="wrapper">
        <div className="transaction-header">
          <h3 className="title">Payment Successful!</h3>
          <p className="subtitle">We have received your payment.</p>
        </div>

        <hr />

        <div className="date-holder">
          <span className="context">Date </span>
          <span>{formatDate(dateTime)}</span>
        </div>

        <div className="time-holder">
          <span className="context">Time </span>
          <span>{formatTimeWithAMPM(dateTime)}</span>
        </div>

        <div className="payment-details-container">
          <span className="context">Payment Method</span>
          <div className="pd-wrapper">
            <div className="icon">
              <img src={stripeIcon} alt="Stripe icon" />
            </div>

            <div className="wallet-details">
              <span>Stripe</span>
              <span>0000</span>
            </div>
          </div>
        </div>

        <div className="action-btns">
          <button className="btn btn-rectangle primary">
            Download Receipt
          </button>
          <button className="btn btn-rectangle secondary">
            Proceed to transaction page
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPayment;
