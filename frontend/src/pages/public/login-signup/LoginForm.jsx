import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch to dispatch actions
import {
  manualLogin,
  saveUserData,
} from "../../../redux/auth/studentAuthSlice"; // Path to your slice
import "./loginSignupStyle.css";
import { GoogleLogin } from "@react-oauth/google";
import showPassword from "../../../assets/images/icons/eye-open.svg";
import hidePassword from "../../../assets/images/icons/eye-closed.svg";
import { baseApi } from "../../../App";

const LoginForm = ({ tab, setErrorMessage, handleTabClick, errorMessage }) => {
  const dispatch = useDispatch(); // Initialize dispatch function
  const navigate = useNavigate();
  const [isShowPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [inputTriggers, setInputTriggers] = useState({
    email: false,
    password: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setUserData((prevData) => ({ ...prevData, password: value }));
    setInputTriggers((prev) => ({ ...prev, password: false }));
  };

  const handleBlur = (field) => {
    setInputTriggers((prev) => ({
      ...prev,
      [field]: !userData[field]?.trim(),
    }));
  };

  const getBorderColor = (field) => (inputTriggers[field] ? "red" : "");

  const responseMessage = async (response) => {
    const token = response.credential;

    try {
      const res = await fetch(`${baseApi}/user/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = await res.json();
        const loginData = {
          token: data.token,
          role: data.role,
          userId: data.userId,
        }; // Dispatch to Redux
        dispatch(manualLogin(loginData));
        navigate("/");
      } else {
        const errorData = await res.json();
        setErrorMessage(
          errorData.message || "Google login failed. Please try again."
        );
      }
    } catch (error) {
      setErrorMessage(
        "An unexpected error occurred during Google login. Please try again later."
      );
    }
  };

  const errorGoogleMessage = (error) => {
    setErrorMessage(
      "An error occurred while processing the Google login. Please try again."
    );
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userData.email || !userData.password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    try {
      const response = await fetch(`${baseApi}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const loginData = {
          token: data.token,
          role: data.role,
          userId: data.userId,
        }; // Dispatch to Redux
        dispatch(saveUserData(loginData));
        navigate("/");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div>
      <form onSubmit={handleLoginSubmit}>
        <div className="auth-form">
          <h2>Welcome back</h2>
          <span
            className={`${errorMessage ? "text-danger" : "text-secondary"}`}
          >
            {errorMessage || "Please complete all required fields to log in."}
          </span>

          {/* Email input */}
          <div>
            <label>Email</label>
            <input
              type="text"
              name="email"
              value={userData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              className="form-control rounded"
              placeholder="Username"
              style={{ borderColor: getBorderColor("email") }}
              required
            />
          </div>

          {/* Password input */}
          <div className="password-field-container">
            <label>Password</label>
            <div className="input-container">
              <input
                type={isShowPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur("password")}
                className="form-control rounded"
                style={{ borderColor: getBorderColor("password") }}
                placeholder="Password"
                required
              />
            </div>
            <div
              className="login pass-icon"
              onClick={() => setShowPassword(!isShowPassword)}
            >
              <img
                src={isShowPassword ? showPassword : hidePassword}
                alt="Toggle password visibility"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-buttons d-block">
            <button type="submit" className="btn btn-primary w-100">
              Log In
            </button>
            <button className="btn btn-secondary w-100">Forgot Password</button>
            <GoogleLogin
              onSuccess={responseMessage}
              onError={errorGoogleMessage}
            />
            <div className="or-divider">
              <span>or</span>
            </div>
            <p>
              Don't have an account?{" "}
              <a onClick={() => handleTabClick("registerTab")} className="link">
                Sign up here!
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
