import React, { useState } from "react";
import TransactionsTable from "../../../../components/User/LendersPOV/Transactions";
import "./myTransactionsStyles.css";

function MyTransactions() {
  const [merchantSettings, setMerchantSettings] = useState({
    storeName: "",
    countryCode: "",
  });

  const [payoutSettings, setPayoutSettings] = useState({
    stripeAccountId: "acct_123456789",
    pendingBalance: 1200.5,
    availableBalance: 800.3,
  });

  const [payoutSchedule, setPayoutSchedule] = useState("Current");

  const handleMerchantChange = (e) => {
    const { name, value } = e.target;
    setMerchantSettings((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleScheduleChange = (e) => {
    setPayoutSchedule(e.target.value);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Seller Dashboard</h1>

      <div className="section">
        <h2 className="section-title">Merchant Settings</h2>
        <div className="card">
          <input
            type="text"
            name="storeName"
            value={merchantSettings.storeName}
            onChange={handleMerchantChange}
            className="input-field"
            placeholder="Store Name"
          />
          <input
            type="text"
            name="countryCode"
            value={merchantSettings.countryCode}
            onChange={handleMerchantChange}
            className="input-field"
            placeholder="Country Code"
          />
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Payout Settings</h2>
        <div className="card payout-card">
          <div className="info">
            <strong>Stripe Account ID:</strong> {payoutSettings.stripeAccountId}
          </div>
          <div className="info">
            <strong>Pending Balance:</strong> ${payoutSettings.pendingBalance.toFixed(2)}
          </div>
          <div className="info">
            <strong>Available Balance:</strong> ${payoutSettings.availableBalance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Payout Schedule</h2>
        <div className="card schedule-card">
          <div>Current Schedule: {payoutSchedule}</div>
          <select
            value={payoutSchedule}
            onChange={handleScheduleChange}
            className="select-field"
          >
            <option value="Current">Current</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Transactions</h2>
        <div className="card transactions-card">
          <TransactionsTable />
        </div>
      </div>
    </div>
  );
}

export default MyTransactions;
