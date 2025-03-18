import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TransactionsTable from "../../../../components/User/LendersPOV/Transactions";
import {
  fetchMerchant,
  updateMerchant,
} from "../../../../redux/merchant/merchantSlice";
import axios from "axios";
import "./myTransactionsStyles.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import ShowAlert from "../../../../utils/ShowAlert";
import { useSystemConfig } from "../../../../context/SystemConfigProvider";
import { fetchRentalTransactions } from "../../../../redux/transactions/rentalTransactionsSlice";

const MyTransactions = () => {
  const dispatch = useDispatch();

  const {
    merchantSettings,
    payoutSettings,
    payoutSchedule,
    loadingFetchMerchant,
    status,
    message,
    errorFetchMerchant,
    loadingUpdateMerchant,
    errorUpdateMerchant,
  } = useSelector((state) => state.merchant);
  const studentUser = useSelector(selectStudentUser);
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const { config } = useSystemConfig();
  const {
    stats,
    transactions,
    loading,
    error,
    totalTransactions,
    revenue,
    successfulTransactions,
  } = useSelector((state) => state.rentalTransactions);

  useEffect(() => {
    if (studentUser?.userId) {
      dispatch(fetchMerchant(studentUser.userId));
      dispatch(fetchRentalTransactions(studentUser.userId));
    }
  }, [dispatch, studentUser?.userId]);

  const handleMerchantChange = (e) => {
    const { name, value } = e.target;
    dispatch(
      updateMerchant({
        id: studentUser?.userId,
        updates: { merchantSettings: { [name]: value } },
      })
    );
  };

  const handleScheduleChange = (e) => {
    const newSchedule = e.target.value;
    dispatch(
      updateMerchant({
        id: studentUser?.userId,
        updates: { payoutSchedule: newSchedule },
      })
    );
  };

  const handleConnectStripe = async () => {
    ShowAlert(
      dispatch,
      "loading",
      "Please wait",
      "We're redirecting you to stripe express."
    );
    try {
      const response = await axios.post(
        "http://localhost:3001/user/create-onboarding-link",
        {
          email: user.user.email,
          userId: studentUser.userId,
        }
      );

      window.location.href = response.data.url;
    } catch (error) {
      ShowAlert(
        dispatch,
        "error",
        "Failed to connect to Stripe.",
        "Please try again later."
      );
    }
  };

  const handleCompleteStripeSetup = () => {
    if (status?.completionLink) {
      window.location.href = status.completionLink;
    } else {
      ShowAlert(dispatch, "error", "No Completion Link", "Try again later.");
    }
  };

  if (loadingFetchMerchant) {
    return (
      <div className="item-container">
        <div className="loading-state">Loading merchant data...</div>
      </div>
    );
  }

  const goToStripeDashboard = () => {
    window.open("https://dashboard.stripe.com", "_blank");
  };

  // Determine whether to show Stripe connection UI
  const showStripeConnection =
    config?.Stripe && !payoutSettings?.stripeAccountId;
  const showStripeCompletion =
    config?.Stripe && status?.restricted && status?.completionLink;

  return (
    <div className="item-container">
      <h2 className="text-center">Dashboard</h2>
      <div className="card-items-container">
        {/* Stats container is always shown */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Transactions</h3>
            <p>{stats.totalTransactions || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>P{parseFloat(stats.revenue).toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Transactions</h3>
            <p>{stats.successfulTransactions}</p>
          </div>
        </div>

        {/* Show Stripe connection UI if needed */}
        {showStripeConnection && (
          <div className="connect-stripe-container">
            <h1>Connect Your Stripe Account</h1>
            <p>To start accepting payments, connect your Stripe account</p>
            <p>{message ? message : ""}</p>
            <button
              className="connect-stripe-button"
              onClick={handleConnectStripe}
            >
              Connect with Stripe
            </button>
          </div>
        )}

        {/* Show Stripe completion UI if needed */}
        {showStripeCompletion && (
          <div className="connect-stripe-container">
            <h1>Continue Setting Up</h1>
            <p>
              Your Stripe account is restricted. Complete the setup to enable
              payments.
            </p>
            <p>{message ? message : ""}</p>
            <button
              className="connect-stripe-button"
              onClick={handleCompleteStripeSetup}
            >
              Click Here to Complete
            </button>
          </div>
        )}

        {/* Show Stripe dashboard info if connected */}
        {config?.Stripe &&
          payoutSettings?.stripeAccountId &&
          !showStripeCompletion && (
            <>
              <div className="dashboard-header">
                <div>
                  <h3>Merchant Stripe Dashboard</h3>
                  <span className="account-id">
                    ID: {payoutSettings.stripeAccountId}
                  </span>
                </div>
              </div>

              <div className="balance-cards">
                <div className="balance-card available">
                  <div className="balance-header">
                    <h3>Available Balance</h3>
                    <p>Ready to withdraw</p>
                  </div>
                  <div className="balance-amount">
                    ${payoutSettings?.availableBalance}
                  </div>
                </div>

                <div className="balance-card pending">
                  <div className="balance-header">
                    <h3>Pending Balance</h3>
                    <p>Processing payments</p>
                  </div>
                  <div className="balance-amount">
                    ${payoutSettings?.pendingBalance}
                  </div>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <h2>Merchant Details</h2>
                  <div className="form-group">
                    <label htmlFor="storeName">Store Name</label>
                    <input
                      type="text"
                      id="storeName"
                      name="storeName"
                      value={merchantSettings?.storeName || ""}
                      onChange={handleMerchantChange}
                      placeholder="Enter store name"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="countryCode">Country Code</label>
                    <input
                      type="text"
                      id="countryCode"
                      name="countryCode"
                      value={merchantSettings?.countryCode || ""}
                      onChange={handleMerchantChange}
                      placeholder="Enter country code"
                      disabled
                    />
                  </div>
                  {errorUpdateMerchant && (
                    <p className="error-text">
                      Error updating: {errorUpdateMerchant}
                    </p>
                  )}
                </div>

                <div className="settings-card">
                  <h2>Payout Schedule</h2>
                  <div className="form-group">
                    <label htmlFor="schedule">Current Schedule</label>
                    <input
                      type="text"
                      id="countryCode"
                      name="countryCode"
                      value={"Current"}
                      onChange={handleScheduleChange}
                      placeholder="Enter country code"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </>
          )}

        {/* Transactions table is always shown */}
        <div className="transactions-card">
          <div className="transactions-table">
            <TransactionsTable transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTransactions;
