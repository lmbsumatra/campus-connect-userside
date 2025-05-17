import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStripeAdminOverview } from "../../../../redux/admin/stripeAdminSlice";
import { updateSystemConfig } from "../../../../redux/system-config/systemConfigSlice";
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
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Check if user is authenticated using context
    if (!adminUser || !adminUser.token) {
      console.log("No admin user found in context, redirecting to login");
      navigate("/admin/login");
      return;
    }

    // Don't set tokens in localStorage - they should already be there from the AuthContext
    // Instead, pass the current token directly to the action
    const fetchData = async () => {
      try {
        // Check if Stripe is enabled in system config
        if (config && config.Stripe === false) {
          setErrorMessage("Stripe payments are disabled in system settings. Enable Stripe in Settings to view the dashboard.");
          return;
        }
        
        const result = await dispatch(fetchStripeAdminOverview(adminUser.token));

        // Clear any existing error message on success
        setErrorMessage(null);

        // If there was an error, handle authentication issues
        if (fetchStripeAdminOverview.rejected.match(result)) {
          if (result.payload && result.payload.includes("Stripe payments are disabled")) {
            setErrorMessage("Stripe payments are disabled in system settings. Enable Stripe in Settings to view the dashboard.");
          } else if (
            result.payload &&
            (result.payload.includes("Session expired") ||
              result.payload.includes("Authentication required"))
          ) {
            navigate("/admin/login");
          }
        }
      } catch (err) {
        console.error("Error fetching Stripe data:", err);
        setErrorMessage("Error loading Stripe dashboard. Please try again later.");
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
  }, [dispatch, navigate, adminUser, config]);

  // Handle auth errors from the redux state
  useEffect(() => {
    if (error) {
      if (error.includes("Session expired") ||
        error.includes("Authentication required")) {
        navigate("/admin/login");
      } else if (error.includes("Stripe payments are disabled")) {
        setErrorMessage("Stripe payments are disabled in system settings. Enable Stripe in Settings to view the dashboard.");
      }
    }
  }, [error, navigate]);

  const handleEnableStripe = () => {
    dispatch(updateSystemConfig({ config: "Stripe", config_value: true }))
      .then(() => {
        setErrorMessage(null);
      })
      .catch(err => {
        console.error("Error enabling Stripe:", err);
      });
  };

  if (errorMessage) {
    return (
      <div className="stripe-disabled-container">
        <h2>Stripe Dashboard Unavailable</h2>
        <p>{errorMessage}</p>
        <button onClick={handleEnableStripe} className="btn btn-primary mt-3">
          Enable Stripe
        </button>
      </div>
    );
  }

  if (loading && !platformBalance?.available) {
    return <div className="loading-state">Loading Stripe data...</div>;
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
          <p>${platformBalance?.available?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Balance</h3>
          <p>${platformBalance?.pending?.toFixed(2) || "0.00"}</p>
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
              {recentTransactions && recentTransactions.length > 0 ? (
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
