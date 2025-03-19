import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Trial2 from "./Trial2";
import Trial from "./Trial";
import { resetLoginForm } from "../../../redux/login-form/loginFormSlice";
import { resetSignupForm } from "../../../redux/signup-form/signupFormSlice";
import "./loginSignupStyle.css";
import gearIcon from "./gear-blue.svg"; // Renamed for clarity

const TRANSITION_DURATION = 300;
const TABS = {
  LOGIN: "loginTab",
  SIGNUP: "signupTab",
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
    if (isFirstRender) {
     
      return activeTab === TABS.LOGIN ? "left-position" : "right-position";
    }
    return gearPosition === "gear-left" ? "gear-right" : "gear-left";
  };

  const renderAuthContent = () => {
    const sharedProps = {
      onTabClick: handleTabSwitch,
      errorMessage,
      setErrorMessage,
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

  return (
    <div className="overlay">
      <div className="custom-modal overlay">
        <button className="modal-close" onClick={onClose}>
          Close
        </button>

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
