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
import {
  UPDATE_FORM,
  onInputChange,
  onBlur,
} from "../hooks/input-reducers/loginInputReducer"; // Form handling
import emailIcon from "../assets/images/input-icons/email.svg"; // Email input icon
import passwordIcon from "../assets/images/input-icons/password.svg"; // Password input icon
import hidePasswordIcon from "../assets/images/input-icons/hide-password.svg"; // Password visibility toggle icon
import warningIcon from "../assets/images/input-icons/warning.svg";

// Styles
import "./Trial.css"; // Component-specific styles

// Initial form state (email, password, and form validity)
const initialState = {
  email: { value: "", triggered: false, hasError: true, error: "" },
  password: { value: "", triggered: false, hasError: true, error: "" },
  isFormValid: false, // Flag to enable/disable the login button
};

// Reducer to manage form state updates and validation errors
const formsReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_FORM:
      return {
        ...state,
        [action.data.name]: {
          ...state[action.data.name],
          value: action.data.value,
          hasError: action.data.hasError,
          error: action.data.error,
          triggered: action.data.triggered,
        },
        isFormValid: action.data.isFormValid, // Update form validity based on input state
      };
    default:
      return state;
  }
};

const Trial2 = () => {
  const [loginDataState, dispatch] = useReducer(formsReducer, initialState);
  const { loginStudent } = useAuth(); // Access login function from AuthContext
  const [errorMessage, setErrorMessage] = useState(null);
  const {
    loading,
    error: errorGoogleLogin,
    userData,
    handleSuccess,
    handleError,
  } = useGoogleLogin();
  const navigate = useNavigate(); // Navigation hook

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
    <div className="m-5 d-flex flex-column align-items-center">
      {/* Email Input */}
      <div className="form-wrapper">
        <label htmlFor="email" className="label">
          Email
        </label>
        <div className="login input-wrapper">
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
              onInputChange("email", e.target.value, dispatch, loginDataState)
            } // Handle change
            onBlur={(e) =>
              onBlur("email", e.target.value, dispatch, loginDataState)
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
        )}
      </div>

      {/* Password Input */}
      <div className="form-wrapper">
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="login input-wrapper">
          <img className="icon" src={passwordIcon} alt="Password Icon" />
          <input
            id="password"
            className="input"
            placeholder="Your password"
            required
            type="password"
            value={loginDataState.password.value}
            onChange={(e) =>
              onInputChange(
                "password",
                e.target.value,
                dispatch,
                loginDataState
              )
            } // Handle change
            onBlur={(e) =>
              onBlur("password", e.target.value, dispatch, loginDataState)
            } // Handle blur
          />
          <img
            className="password-toggle-icon"
            src={hidePasswordIcon}
            alt="Password Icon"
          />{" "}
          {/* Password visibility toggle */}
        </div>
        {loginDataState.password.triggered && loginDataState.password.hasError && (
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
