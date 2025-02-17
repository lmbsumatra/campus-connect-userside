import { useEffect } from "react";
import { formatDate, formatTimeWithAMPM } from "../../../../utils/dateFormat";
import "./cancelPaymentStyles.css";
import stripeIcon from "./stripe.svg";

const CancelPayment = () => {
  const dateTime = new Date();

  useEffect(() => {
    const handleRedirectToTransactionPage = () => {};
    handleRedirectToTransactionPage();
  });

  return (
    <div className="cancel-payment-container">
      <div className="wrapper">
        <div className="transaction-header">
          <h3 className="title">Payment Cancelled!</h3>
          <p className="subtitle text-center">
            It seems that you have cancelled your payment. <br />
            <br /> We are canceling your transaction. <br />
          </p>
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
          <button className="btn btn-rectangle secondary">Back</button>
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
