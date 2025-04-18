import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./loginSignupStyle.css"; 
import CCLOGO from "../../../assets/images/navbar/cc-logo.png";
import { resetPassword } from "../../../redux/auth/studentAuthSlice";
import { useDispatch } from "react-redux";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setMessage("Invalid password reset link");
      setMessageType("error");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setMessageType("error");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      setMessageType("");

      const response = await dispatch(
        resetPassword({
          token,
          newPassword,
        })
      );

      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);

      setMessage(
        error.response?.data?.message ||
          "An error occurred. Please try again later."
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-container">
              <img
                src={CCLOGO}
                alt="RenTUPeers Logo"
                className="auth-logo"
              />
              <h1>RenTUPeers</h1>
            </div>
            <h2>Invalid Reset Link</h2>
          </div>

          <div className="error-message">{message}</div>

          <div className="auth-links">
            <Link to="/forgot-password" className="auth-button primary-button">
              Request New Password Reset
            </Link>
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <img
              src="/path-to-your-logo.png"
              alt="RenTUPeers Logo"
              className="auth-logo"
            />
            <h1>RenTUPeers</h1>
          </div>
          <h2>Create New Password</h2>
        </div>

        {message && (
          <div className={`message ${messageType}-message`}>{message}</div>
        )}

        {messageType === "success" ? (
          <div className="success-container">
            <p>
              Your password has been reset successfully! You will be redirected
              to the login page.
            </p>
            <Link to="/login" className="auth-link">
              Go to Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-description">
              Please create a new password for your account.
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                disabled={isSubmitting}
                required
                minLength="8"
              />
              <small className="form-hint">
                Password must be at least 8 characters long
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                disabled={isSubmitting}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
