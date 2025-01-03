// LoginSignUp.jsx
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Trial2 from "./Trial2";
import Trial from "./Trial";
import { resetLoginForm } from "../../../redux/login-form/loginFormSlice";
import { resetSignupForm } from "../../../redux/signup-form/signupFormSlice";
import loginImage from "../../../assets/images/auth/login.jpg";
import "./loginSignupStyle.css";

const LoginSignUp = ({ tab, onClose, show }) => {
  const [authTab, setAuthTab] = useState(tab);
  const [errorMessage, setErrorMessage] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setAuthTab(tab);
  }, [tab]);

  const handleTabClick = (newTab) => {
    setTransitioning(true);
    setTimeout(() => {
      setAuthTab(newTab);
      resetForm(newTab);
      setErrorMessage("");
      setTransitioning(false);
    }, 300);
  };

  const resetForm = (tab) => {
    dispatch(tab === "loginTab" ? resetLoginForm() : resetSignupForm());
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      dialogClassName="auth-modal"
      contentClassName="modal-content-fixed"
    >
      <button className="modal-close" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      
      <div className="auth-wrapper">
        {authTab === "loginTab" ? (
          <div className={`auth-content ${transitioning ? 'transitioning' : ''}`}>
            <div className={`image-section ${transitioning ? 'slide-left' : ''}`}>
              <div className="image-gradient">
                <img src={loginImage} alt="Login" />
              </div>
            </div>
            <div className={`form-section ${transitioning ? 'fade-out' : 'fade-in'}`}>
              <h2>Welcome Back</h2>
              <div className="form-container">
                <Trial2
                  onTabClick={handleTabClick}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={`auth-content ${transitioning ? 'transitioning' : ''}`}>
            <div className={`form-section ${transitioning ? 'fade-out' : 'fade-in'}`}>
              <h2>Create Account</h2>
              <div className="form-container scrollable">
                <Trial
                  onTabClick={handleTabClick}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                />
              </div>
            </div>
            <div className={`image-section ${transitioning ? 'slide-right' : ''}`}>
              <div className="image-gradient">
                <img src={loginImage} alt="Sign Up" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LoginSignUp;