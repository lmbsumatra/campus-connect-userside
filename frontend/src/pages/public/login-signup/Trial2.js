// Core Libraries
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation within the app

// Third-party Libraries
import { GoogleLogin } from "@react-oauth/google"; // Google OAuth login component

// Custom Hooks
import { useDispatch, useSelector } from "react-redux"; // For Redux state and actions

// Components and Assets
import {
  updateField,
  blurField,
} from "../../../redux/login-form/loginFormSlice"; // Redux Toolkit slice actions
import emailIcon from "../../../assets/images/input-icons/email.svg"; // Email input icon
import passwordIcon from "../../../assets/images/input-icons/password.svg"; // Password visibility toggle icon
import showPasswordIcon from "../../../assets/images/input-icons/show-password.svg"; // Password visibility toggle icon
import hidePasswordIcon from "../../../assets/images/input-icons/hide-password.svg"; // Password visibility toggle icon
import warningIcon from "../../../assets/images/input-icons/warning.svg"; // Warning icon for validation

// Styles
// import "../trial/Trial.css"; // Component-specific styles
import { manualLogin, googleLogin } from "../../../redux/auth/studentAuthSlice"; // Import login actions
import ShowAlert from "../../../utils/ShowAlert";

const Trial2 = ({ onTabClick, onForgotPassword }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate(); // Navigation hook

  // Redux Toolkit hooks
  const dispatch = useDispatch();
  const loginDataState = useSelector((state) => state.loginForm);
  const loadingManualLogin = useSelector((state) => state.studentAuth.loading); // Loading state for manual login
  const errorManualLogin = useSelector((state) => state.studentAuth.error);
  const [showPassword, setShowPassword] = useState(false);

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
        ShowAlert(
          dispatch,
          "success",
          "Login successful!",
          "You are now logged in!",
          { text: "OK" }
        );
        navigate(0);
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
        navigate(0);
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

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="form-wrapper">
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
        <div className="input-wrapper2">
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
        <div className="input-wrapper2">
          <img className="icon" src={passwordIcon} alt="Password Icon" />
          <input
            id="password"
            className="input"
            placeholder="Your password"
            required
            type={showPassword ? "text" : "password"}
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
            src={showPassword ? showPasswordIcon : hidePasswordIcon}
            alt="Toggle password visibility"
            onClick={togglePasswordVisibility}
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
      <div className="forgot-password-link">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-button"
        >
          Forgot Password?
        </button>
      </div>
      <div className="or-divider">
        <span>or</span>
      </div>
      <div className="d-flex justify-content-between align-items-center w-100">
        <span>Login with</span>
        {/* Google Login */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
      {/* Sign-up Link */}
      <p>
        Don't have an account?{" "}
        <a
          className="link fw-bold"
          style={{ cursor: "pointer" }}
          onClick={() => onTabClick("signupTab")}
        >
          Sign up here!
        </a>
      </p>
    </div>
  );
};

export default Trial2;
