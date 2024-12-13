// React Imports
import React, { useState, useEffect } from "react";

// React Router
import { useNavigate, useLocation } from "react-router-dom";

// Assets
import ccLogo from "../../../assets/images/navbar/cc-logo.png";
import Language from "../../../assets/images/icons/language.svg";

// Components
import Notification from "../notif/Notification.jsx";
import Message from "../inbox/Message.jsx";
import UserDropdown from "../dropdown/UserDropdown.jsx";

// Pages
import LoginSignUp from "../../../pages/public/login-signup/LoginSignup.js";

// Styles
import "./navbarStyles.css";

const NavBar = () => {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginSignUp, setShowLoginSignUp] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  // Update active tab based on the current location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("shop")) {
      setActiveTab("shop");
    } else if (path.includes("rent")) {
      setActiveTab("rent");
    } else if (path.includes("lend")) {
      setActiveTab("lend");
    } else {
      setActiveTab("home");
    }
  }, [location]);

  // Tab management
  function setTab(tab) {
    setActiveTab(tab);
    navigate(`/${tab}`);
  }

  // Popup management
  function handleAuth() {
    setShowLoginSignUp(true);
  }

  // Toggle functions
  function toggleDropdown() {
    setShowDropdown(!showDropdown);
  }

  function toggleNotifications() {
    setShowNotifications(!showNotifications);
  }

  function toggleMessages() {
    setShowMessages(!showMessages);
  }

  return (
    <div className="container fs-6">
      <div className="nav-content">
        <nav className="nav-content">
          <div className="nav-logo">
            <a
              className={`nav-link ${activeTab === "home" ? "active fw-bold" : ""}`}
              aria-current="page"
              href="/home"
              onClick={() => setTab("home")}
            >
              <img src={ccLogo} alt="Logo" />
            </a>
          </div>
          {!isLoggedIn ? (
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </div>
          ) : null}
          <ul className="nav nav-icons">
            <li className="nav-item">
              <Notification
                showNotifications={showNotifications}
                toggleNotifications={toggleNotifications}
              />
            </li>
            <li className="nav-item">
              <Message
                showDropdown={showMessages}
                toggleDropdown={toggleMessages}
              />
            </li>
            <li className="nav-item">
              <UserDropdown
                showDropdown={showDropdown}
                toggleDropdown={toggleDropdown}
                handleClick={handleAuth}
              />
            </li>
            <li className="nav-item nav-language">
              <a className="icon-link" href="">
                <img src={Language} alt="Language Icon" />
              </a>
              <span>EN</span>
            </li>
          </ul>
        </nav>
        <nav className="subnavbar">
          <ul className="nav custom-nav-underline">
            {["home", "shop", "rent", "lend"].map((tab) => (
              <li className="nav-item" key={tab}>
                <a
                  className={`nav-link ${activeTab === tab ? "active fw-bold" : ""}`}
                  aria-current="page"
                  href={`/${tab}`}
                  onClick={() => setTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* LoginSignUp popup */}
      {showLoginSignUp && (
        <div className="popup-overlay">
          <div className="popup-content">
            <LoginSignUp />
            <button onClick={() => setShowLoginSignUp(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
