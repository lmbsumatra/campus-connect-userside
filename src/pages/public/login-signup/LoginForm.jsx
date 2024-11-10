// React Imports
import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import "./loginSignupStyle.css";
import { GoogleLogin } from "@react-oauth/google"; // Google Login library
import { useAuth } from "../../../context/AuthContext"; // Authentication context

const LoginForm = ({ tab, setErrorMessage, handleTabClick, errorMessage }) => {
  const { loginStudent } = useAuth(); // Access login function from AuthContext
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    tupId: "",
    confirmPassword: "",
  });

  // State for managing input triggers (validation state)
  const [inputTriggers, setInputTriggers] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    middleName: false,
    tupId: false,
    confirmPassword: false,
  });

  // Handle user data input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle password field change and reset triggers
  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setUserData((prevData) => ({ ...prevData, password: value }));
    setInputTriggers((prev) => ({ ...prev, password: false }));
  };

  // Handle validation on input blur (losing focus)
  const handleBlur = (field) => {
    setInputTriggers((prev) => ({ ...prev, [field]: !userData[field] }));
  };

  // Function to dynamically change border color based on validation state
  const getBorderColor = (field) => (inputTriggers[field] ? "red" : "");

  // Handle successful response from Google login
  const responseMessage = async (response) => {
    const token = response.credential;

    try {
      const res = await fetch("http://localhost:3001/user/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = await res.json();
        loginStudent(data.token, data.role, data.userId); // Handle successful login
        navigate("/"); // Navigate to home after login
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "Google login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred during Google login. Please try again later.");
    }
  };

  // Handle errors during Google login
  const errorGoogleMessage = (error) => {
    setErrorMessage("An error occurred while processing the Google login. Please try again.");
  };

  // Handle form submission for normal login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message before submission

    try {
      const response = await fetch("http://localhost:3001/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        loginStudent(data.token, data.role, data.userId);
        navigate("/"); // Navigate to the homepage after successful login
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
          <span className={`${errorMessage ? "text-danger" : "text-secondary"}`}>
            {errorMessage ? errorMessage : "Please complete all required fields to log in."}
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
          <div>
            <label>Password</label>
            <input
              type="password"
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
