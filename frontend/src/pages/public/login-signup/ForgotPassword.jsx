import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "./loginSignupStyle.css";
import { forgotPassword } from "../../../redux/auth/studentAuthSlice";

const ForgotPassword = ({ onClose, show, onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (show) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => document.body.classList.remove("no-scroll");
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await dispatch(forgotPassword(email));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage("Password reset link has been sent to your email!");

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setErrorMessage("Failed to send reset link. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overlay">
      <div className="custom-modal overlay">
        <div className="btn-container2">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="auth-wrapper">
          <div className="auth-content fade-in">
            <div className="form-container forgot-password-tab">
              <h2>Reset Your Password</h2>

              {successMessage ? (
                <div className="success-message">
                  <p>{successMessage}</p>
                  <button className="btn btn-primary" onClick={onClose}>
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="reset-instructions">
                    Enter your email address below and we'll send you a link to
                    reset your password.
                  </p>

                  {errorMessage && (
                    <div className="error-message">
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="button-group">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary back-to-login"
                      onClick={onBackToLogin}
                      disabled={isSubmitting}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
