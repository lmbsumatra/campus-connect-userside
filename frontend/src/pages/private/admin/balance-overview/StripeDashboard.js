import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStripeAdminOverview } from "../../../../redux/admin/stripeAdminSlice";
import { useSystemConfig } from "../../../../context/SystemConfigProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./stripeDashboardStyles.css";

const StripeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminUser } = useAuth();
  const {
    platformBalance,
    connectedAccounts,
    recentTransactions,
    loading,
    error,
  } = useSelector((state) => state.stripeAdmin);
  const { config } = useSystemConfig();

  useEffect(() => {
    // Check if user is authenticated using context
    if (!adminUser || !adminUser.token) {
      console.log("No admin user found in context, redirecting to login");
      navigate("/admin/login");
      return;
    }

    // Set tokens in localStorage for the API call
    localStorage.setItem("adminToken", adminUser.token);
    localStorage.setItem("adminRefreshToken", adminUser.refreshToken);

    const fetchData = async () => {
      try {
        const result = await dispatch(fetchStripeAdminOverview());

        // If there was an error, handle authentication issues
        if (fetchStripeAdminOverview.rejected.match(result)) {
          if (
            result.payload &&
            (result.payload.includes("Session expired") ||
              result.payload.includes("Authentication required"))
          ) {
            navigate("/admin/login");
          }
        }
      } catch (err) {
        console.error("Error fetching Stripe data:", err);
      }
    };

    fetchData();

    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      if (adminUser && adminUser.token) {
        fetchData();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [dispatch, navigate, adminUser]);

  // Handle auth errors from the redux state
  useEffect(() => {
    if (
      error &&
      (error.includes("Session expired") ||
        error.includes("Authentication required"))
    ) {
      navigate("/admin/login");
    }
  }, [error, navigate]);

  if (loading && !platformBalance.available) {
    return <div className="loading-state">Loading Stripe data...</div>;
  }

  if (!config?.Stripe) {
    return (
      <div className="stripe-disabled-container">
        <h2>Stripe Payments Disabled</h2>
        <p>Stripe payments are currently disabled in system settings.</p>
        <p>Enable Stripe in System Settings to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="stripe-dashboard-container">
      <h2>Balance Overview</h2>

      <div className="admin-stats-container">
        <div className="stat-card">
          <h3>Connected Accounts</h3>
          <p>{connectedAccounts}</p>
        </div>
        <div className="stat-card available">
          <h3>Available Balance</h3>
          <p>${platformBalance.available.toFixed(2)}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Balance</h3>
          <p>${platformBalance.pending.toFixed(2)}</p>
        </div>
      </div>
      <div className="transactions-section">
        <h3>All Activity</h3>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {new Date(
                        transaction.created * 1000
                      ).toLocaleDateString()}
                    </td>
                    <td>{transaction.description || "Transaction"}</td>
                    <td>${(transaction.amount / 100).toFixed(2)}</td>
                    <td>{transaction.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No recent transactions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className="stripe-dashboard-button"
          onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
        >
          View All in Stripe
        </button>
      </div>
    </div>
  );
};

export default StripeDashboard;
