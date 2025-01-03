// Core Libraries
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation within the app

// Third-party Libraries
import { GoogleLogin } from "@react-oauth/google"; // Google OAuth login component

// Custom Hooks
import { useDispatch, useSelector } from "react-redux"; // For Redux state and actions

// Components and Assets
import { updateField, blurField } from "../redux/login-form/loginFormSlice"; // Redux Toolkit slice actions
import emailIcon from "../assets/images/input-icons/email.svg"; // Email input icon
import passwordIcon from "../assets/images/input-icons/password.svg"; // Password visibility toggle icon
import hidePasswordIcon from "../assets/images/input-icons/hide-password.svg"; // Password visibility toggle icon
import warningIcon from "../assets/images/input-icons/warning.svg"; // Warning icon for validation

// Styles
import "./Trial.css"; // Component-specific styles
import { manualLogin, googleLogin } from "../redux/auth/studentAuthSlice"; // Import login actions
import ShowAlert from "../utils/ShowAlert";

const Trial2 = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate(); // Navigation hook

  // Redux Toolkit hooks
  const dispatch = useDispatch();
  const loginDataState = useSelector((state) => state.loginForm);
  const loadingManualLogin = useSelector((state) => state.studentAuth.loading); // Loading state for manual login
  const errorManualLogin = useSelector((state) => state.studentAuth.error);

  useEffect(() => {
    if (errorManualLogin) {
      setErrorMessage(errorManualLogin); // Set manual login error
    } else {
      setErrorMessage(null); // Reset if no error
    }
  }, [errorManualLogin]);

  // Handle manual login
  const handleLogin = async (e) => {
    e.preventDefault();
    ShowAlert(dispatch, "loading", "Logging you in!");
    const loginData = {
      email: loginDataState.email.value,
      password: loginDataState.password.value,
    };
    dispatch(manualLogin(loginData))
      .unwrap()
      .then(() => {
        ShowAlert(dispatch, "success", "Login successful!");
        navigate("/");
      })
      .catch((error) => {
        ShowAlert(dispatch, "error", error);
      });
  };

  // Handle Google login success
  const handleGoogleSuccess = (response) => {
    const token = response.credential; // Extract token from Google's response
    dispatch(googleLogin(token))
      .unwrap()
      .then(() => {
        ShowAlert(dispatch, "success", "Login successful!");
        navigate("/");
      })
      .catch((error) => {
        ShowAlert(dispatch, "error", error);
        setErrorMessage(error);
      });
  };

  // Handle Google login error
  const handleGoogleError = () => {
    setErrorMessage("An error occurred during Google login. Please try again.");
  };

  return (
    <div className="">
      {/* Email Input */}
      {errorManualLogin && (
        <div className="validation error">
          <img src={warningIcon} className="icon" alt="Error on email" />
          <span className="text">{errorManualLogin}</span>
        </div>
      )}
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
            }
            onBlur={(e) =>
              dispatch(blurField({ name: "email", value: e.target.value }))
            }
          />
        </div>
        {loginDataState.email.triggered && loginDataState.email.hasError && (
          <div className="validation error">
            <img src={warningIcon} className="icon" alt="Error on email" />
            <span className="text">{loginDataState.email.error}</span>
          </div>
        )}
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
              dispatch(updateField({ name: "password", value: e.target.value }))
            }
            onBlur={(e) =>
              dispatch(blurField({ name: "password", value: e.target.value }))
            }
          />
          <img
            className="password-toggle-icon"
            src={hidePasswordIcon}
            alt="Password visibility toggle"
          />
        </div>
        {loginDataState.password.triggered &&
          loginDataState.password.hasError && (
            <div className="validation error">
              <img src={warningIcon} className="icon" alt="Error on password" />
              <span className="text">{loginDataState.password.error}</span>
            </div>
          )}
      </div>

      {/* Submit Button */}
      <button
        className="btn btn-primary"
        onClick={handleLogin}
        disabled={!loginDataState.isFormValid || loadingManualLogin}
      >
        {loadingManualLogin ? "Logging in..." : "Login"}
      </button>

      {/* Forgot Password Link */}
      <button className="btn btn-secondary">Forgot Password</button>

      {/* Google Login */}
      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

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
