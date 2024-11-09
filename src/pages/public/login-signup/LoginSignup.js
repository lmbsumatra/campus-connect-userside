// React Imports
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./loginSignupStyle.css";
import { Modal } from "react-bootstrap"; // Bootstrap modal for the popup
import LoginForm from "./LoginForm"; // Login form component
import SignupForm from "./SignupForm"; // Signup form component
import { useAuth } from "../../../context/AuthContext"; // Custom Auth context for login

const LoginSignUp = ({ tab, onClose, show }) => {
  // Local state to manage the active tab (login or register)
  const [authTab, setAuthTab] = useState(tab);
  const [errorMessage, setErrorMessage] = useState(""); // To display errors
  const [uploadedImage, setUploadedImage] = useState(null); // For image upload (if applicable)
  const [uploadedId, setUploadedId] = useState(null); // For ID upload (if applicable)

  // User data for both login and signup forms
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    tupId: "",
    confirmPassword: "",
  });

  // Triggers for input fields (for validation feedback)
  const [inputTriggers, setInputTriggers] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    middleName: false,
    tupId: false,
    confirmPassword: false,
  });

  // Effect to sync tab state (login or register) with prop change
  useEffect(() => {
    setAuthTab(tab);
  }, [tab]);

  // Handle tab switching between Login and Sign Up
  const handleTabClick = (tab) => {
    setAuthTab(tab);
    resetForm(); // Reset the form when switching tabs
    setErrorMessage(""); // Clear error message
  };

  // Reset form fields and validation states
  const resetForm = () => {
    setUploadedImage(null);
    setUploadedId(null);
    setUserData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      middleName: "",
      tupId: "",
      confirmPassword: "",
    });
    setInputTriggers({
      email: false,
      password: false,
      firstName: false,
      lastName: false,
      tupId: false,
      confirmPassword: false,
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      {/* Modal Header with Tab Buttons (Login/Sign Up) */}
      <Modal.Header closeButton>
        <div className="tab-buttons w-100">
          {/* Login Tab */}
          <div
            onClick={() => handleTabClick("loginTab")}
            className={`tab ${authTab === "loginTab" ? "active" : ""}`}
          >
            Log In
          </div>
          {/* Register Tab */}
          <div
            onClick={() => handleTabClick("registerTab")}
            className={`tab ${authTab === "registerTab" ? "active" : ""}`}
          >
            Sign Up
          </div>
        </div>
      </Modal.Header>

      {/* Modal Body with respective Form */}
      <Modal.Body>
        <div className="auth-container">
          {/* Conditional rendering based on active tab */}
          {authTab === "loginTab" ? (
            <LoginForm
              handleTabClick={handleTabClick}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          ) : (
            <SignupForm
              handleTabClick={handleTabClick}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginSignUp;
