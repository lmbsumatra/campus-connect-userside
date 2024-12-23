// Core Libraries
import React, { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation within the app

// Third-party Libraries
import { GoogleLogin } from "@react-oauth/google"; // Google OAuth login component

// Custom Hooks
import useGoogleLogin from "../hooks/useGoogleLogin"; // Custom hook for Google login
import useManualLogin from "../hooks/useManualLogin"; // Custom hook for manual login

// Context
import { useAuth } from "../context/AuthContext"; // Accessing auth context for login

// Components and Assets
import { updateField, blurField } from "../redux/login-form/loginFormSlice"; // Modern Redux Toolkit slice actions
import emailIcon from "../assets/images/input-icons/email.svg"; // Email input icon
import passwordIcon from "../assets/images/input-icons/password.svg"; // Password input icon
import hidePasswordIcon from "../assets/images/input-icons/hide-password.svg"; // Password visibility toggle icon
import warningIcon from "../assets/images/input-icons/warning.svg";

// Styles
import "./Trial.css"; // Component-specific styles
import { useDispatch, useSelector } from "react-redux";

const Trial2 = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const {
    loading,
    error: errorGoogleLogin,
    userData,
    handleSuccess,
    handleError,
  } = useGoogleLogin();
  const navigate = useNavigate(); // Navigation hook
  const { loginStudent } = useAuth(); // Access login function from AuthContext

  // Redux Toolkit hooks
  const dispatch = useDispatch();
  const loginDataState = useSelector((state) => state.loginForm);

  // Use the custom manual login hook for handling form submission
  const { handleLogin, error: errorManualLogin } = useManualLogin(
    loginDataState,
    loginStudent
  );

  // Effect hook to handle successful Google login
  useEffect(() => {
    if (userData) {
      loginStudent(userData.token, userData.role, userData.userId);
      navigate("/"); // Redirect after successful login
    }
  }, [userData, loginStudent, navigate]);

  useEffect(() => {
    if (errorGoogleLogin) {
      setErrorMessage(errorGoogleLogin); // Set Google login error
    } else if (errorManualLogin) {
      setErrorMessage(errorManualLogin); // Set Manual login error
    } else {
      setErrorMessage(null); // Reset if no error
    }
  }, [errorGoogleLogin, errorManualLogin]);

  return (
    <div className="">
      {/* Email Input */}
      <div className="field-container">
        <label htmlFor="email" className="label">
          Email
        </label>
        <div className="input-wrapper">
          <img className="icon" src={emailIcon} alt="Email Icon" />
          <input
            id="email"
            name="email"
            className="input"
            placeholder="Your email"
            required
            type="email"
            value={loginDataState.email.value}
            onChange={(e) =>
              dispatch(updateField({ name: "email", value: e.target.value }))
            } // Handle change
            onBlur={(e) =>
              dispatch(blurField({ name: "email", value: e.target.value }))
            } // Handle blur
          />
        </div>
        {loginDataState.email.triggered && loginDataState.email.hasError && (
          <div className="validation error">
            <img
              src={warningIcon}
              className="icon"
              alt="Error on middle name"
            />{" "}
            <span className="text">{loginDataState.email.error}</span>
          </div> // Show error if email is invalid
        )}{" "}
      </div>

      {/* Password Input */}
      <div className="field-container">
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="input-wrapper">
          <img className="icon" src={passwordIcon} alt="Password Icon" />
          <input
            id="password"
            className="input"
            placeholder="Your password"
            required
            type="password"
            value={loginDataState.password.value}
            onChange={(e) =>
              dispatch(
                updateField({ name: "password", value: e.target.value })
              )
            } // Handle change
            onBlur={(e) =>
              dispatch(blurField({ name: "password", value: e.target.value }))
            } // Handle blur
          />
          <img
            className="password-toggle-icon"
            src={hidePasswordIcon}
            alt="Password Icon"
          />{" "}
          {/* Password visibility toggle */}
        </div>
        {loginDataState.password.triggered &&
          loginDataState.password.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on middle name"
              />{" "}
              <span className="text">{loginDataState.password.error}</span>
            </div> // Show error if email is invalid
          )}
      </div>
      {/* Error message on failed login */}
      {errorMessage && <div className="error">{errorMessage}</div>}
      {/* Submit Button */}
      <button
        className="btn btn-primary"
        onClick={handleLogin} // Trigger the login submit function
        disabled={!loginDataState.isFormValid || loading} // Disable if form is invalid or loading
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {/* Forgot Password Link */}
      <button className="btn btn-secondary">Forgot Password</button>
      {/* Google Login */}
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      <div className="or-divider">
        <span>or</span>
      </div>
      {/* Sign-up Link */}
      <p>
        Don't have an account? <a className="link">Sign up here!</a>
      </p>
    </div>
  );
};

export default Trial2;
