import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Trial2 from "./Trial2";
import Trial from "./Trial";
import { resetLoginForm } from "../../../redux/login-form/loginFormSlice";
import { resetSignupForm } from "../../../redux/signup-form/signupFormSlice";
import ForgotPassword from "./ForgotPassword";
import "./loginSignupStyle.css";
import gearIcon from "./gear-blue.svg"; // Renamed for clarity

const TRANSITION_DURATION = 300;
const TABS = {
  LOGIN: "loginTab",
  SIGNUP: "signupTab",
  FORGOT_PASSWORD: "forgotPasswordTab",
};

const LoginSignup = ({ initialTab, onClose, show }) => {
  // console.log(initialTab);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gearPosition, setGearPosition] = useState(initialTab);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isBottomShadowVisible, setIsBottomShadowVisible] = useState(false);
  const dispatch = useDispatch();

  // Get the authentication state to check login status
  const isLoggedIn = useSelector((state) => !!state.studentAuth.studentUser);

  // Effect to close modal when logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Add a small delay to allow success message to be seen
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [isLoggedIn, onClose]);

  useEffect(() => {
    if (show) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => document.body.classList.remove("no-scroll");
  }, [show]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabSwitch = (newTab) => {
    // Don't animate when switching to/from forgot password
    if (newTab === TABS.FORGOT_PASSWORD || activeTab === TABS.FORGOT_PASSWORD) {
      setActiveTab(newTab);
      dispatch(
        newTab === TABS.LOGIN
          ? resetLoginForm()
          : newTab === TABS.SIGNUP
          ? resetSignupForm()
          : resetLoginForm()
      );
      setErrorMessage("");
      return;
    }

    setGearPosition(activeTab === TABS.LOGIN ? "gear-left" : "gear-right");
    setIsTransitioning(true);
    // setGearPosition((prevPosition) =>
    //   prevPosition === "gear-left" ? "gear-right" : "gear-left"
    // );
    setIsFirstRender(false);

    setTimeout(() => {
      setActiveTab(newTab);
      dispatch(newTab === TABS.LOGIN ? resetLoginForm() : resetSignupForm());
      setErrorMessage("");
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  const getGearClassName = () => {
    if (activeTab === TABS.FORGOT_PASSWORD) {
      return "hidden"; // Hide gear for forgot password
    }
    if (isFirstRender) {
      return activeTab === TABS.LOGIN ? "left-position" : "right-position";
    }
    return gearPosition === "gear-left" ? "gear-right" : "gear-left";
  };

  const renderAuthContent = () => {
    // Show forgot password component
    if (activeTab === TABS.FORGOT_PASSWORD) {
      return (
        <ForgotPassword
          onClose={onClose}
          show={show}
          onBackToLogin={() => handleTabSwitch(TABS.LOGIN)}
        />
      );
    }

    const sharedProps = {
      onTabClick: handleTabSwitch,
      errorMessage,
      setErrorMessage,
      onForgotPassword: () => handleTabSwitch(TABS.FORGOT_PASSWORD),
    };

    const contentClassName = `auth-content ${
      isTransitioning ? "fade-out" : "fade-in"
    }`;
    const innerClassName = `${isTransitioning ? "fade-out" : "fade-in"}`;

    return activeTab === TABS.LOGIN ? (
      <div className={contentClassName}>
        <div className={innerClassName}>
          <div
            className={`form-container login-tab ${
              isBottomShadowVisible ? "with-shadow" : ""
            }`}
          >
            <h2>Welcome Back</h2>
            <Trial2 {...sharedProps} />
          </div>
        </div>
      </div>
    ) : (
      <div className={contentClassName}>
        <div className={innerClassName}>
          <div
            className={`form-container signup-tab ${
              isBottomShadowVisible ? "with-shadow" : ""
            }`}
          >
            <h2>Create Account</h2>
            <Trial {...sharedProps} />
          </div>
        </div>
      </div>
    );
  };

  // If in forgot password mode, just render the ForgotPassword component directly
  if (activeTab === TABS.FORGOT_PASSWORD) {
    return (
      <ForgotPassword
        onClose={onClose}
        show={show}
        onBackToLogin={() => handleTabSwitch(TABS.LOGIN)}
      />
    );
  }

  return (
    <div className="overlay">
      <div className="custom-modal overlay">
        <div className="btn-container2">
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "#808080",
              fontSize: "2rem",
              padding: "0",
              cursor: "pointer",
              position: "absolute",
              top: "0px",
              right: "10px",
              zIndex: "10",
            }}
            onClick={() => {
              dispatch(
                activeTab === TABS.LOGIN ? resetLoginForm() : resetSignupForm()
              );
              onClose();
            }}
          >
            <i className="fa fa-times text-secondary"></i>
          </button>
        </div>

        <div className={`bg-gear ${getGearClassName()}`}>
          <img src={gearIcon} alt="Background gear" />
        </div>

        <div
          className={`auth-wrapper ${isTransitioning ? "transitioning" : ""}`}
        >
          {renderAuthContent()}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
