// React Imports
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap"; // Bootstrap modal for the popup
import { useDispatch } from "react-redux"; // For dispatching Redux actions
import "./loginSignupStyle.css";
import Trial2 from "./Trial2"; // Login form component
import Trial from "./Trial"; // Signup form component
import { resetLoginForm } from "../../../redux/login-form/loginFormSlice";
import { resetSignupForm } from "../../../redux/signup-form/signupFormSlice";
import loginImage from "../../../assets/images/auth/login.jpg";

const LoginSignUp = ({ tab, onClose, show }) => {
  const [authTab, setAuthTab] = useState(tab);
  const [errorMessage, setErrorMessage] = useState(""); // To display errors
  const [transitioning, setTransitioning] = useState(false); // For handling animations
  const dispatch = useDispatch(); // Redux dispatch hook

  useEffect(() => {
    setAuthTab(tab);
  }, [tab]);

  const handleTabClick = (tab) => {
    setTransitioning(true); // Start transition
    setTimeout(() => {
      setAuthTab(tab); // Change tab after animation duration
      resetForm(tab);
      setErrorMessage(""); // Clear error message
      setTransitioning(false); // End transition
    }, 300); // Animation duration in ms
  };

  const resetForm = (tab) => {
    if (tab === "loginTab") {
      dispatch(resetLoginForm());
    } else {
      dispatch(resetSignupForm());
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body>
        <div className="auth-container d-flex">
          {authTab === "loginTab" ? (
            <>
              <div
                className={`image-container ${
                  transitioning ? "slide-out-left" : "slide-in-right"
                }`}
              >
                <img
                  src={loginImage}
                  alt="Login"
                  style={{ width: "100px", height: "auto" }}
                />
              </div>
              <div
                className={`form-container ${
                  transitioning ? "fade-out" : "fade-in"
                }`}
              >
                <Trial2
                  onTabClick={handleTabClick}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                />
              </div>
            </>
          ) : (
            <>
              <div
                className={`form-container ${
                  transitioning ? "fade-out" : "fade-in"
                }`}
              >
                <Trial
                  onTabClick={handleTabClick}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                />
              </div>
              <div
                className={`image-container ${
                  transitioning ? "slide-out-right" : "slide-in-left"
                }`}
              >
                <img
                  src={loginImage}
                  alt="Sign Up"
                  style={{ width: "100px", height: "auto" }}
                />
              </div>
            </>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginSignUp;
