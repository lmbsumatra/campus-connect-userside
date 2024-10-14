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
    // Set the active tab based on the current path
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
  function handleLogin() {
    setShowLoginSignUp(true);
  }

  function handleRegister() {
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
        {!isLoggedIn ? (
          <nav>
            <div className="nav-logo">
              <a
                className={`nav-link ${
                  activeTab === "home" ? "active fw-bold" : ""
                }`}
                aria-current="page"
                href="/home"
                onClick={() => setTab("home")}
              >
                <img src={ccLogo} alt="Logo" />
              </a>
            </div>
            <ul className="nav custom-nav-underline">
              {/* Nav items -- Home */}
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeTab === "home" ? "active fw-bold" : ""
                  }`}
                  aria-current="page"
                  href="/home"
                  onClick={() => setTab("home")}
                >
                  Home
                </a>
              </li>
              {/* Nav items -- Shop */}
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeTab === "shop" ? "active fw-bold" : ""
                  }`}
                  aria-current="page"
                  href="/shop"
                  onClick={() => setTab("shop")}
                >
                  Shop
                </a>
              </li>
              {/* Nav items -- Rent */}
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeTab === "rent" ? "active fw-bold" : ""
                  }`}
                  aria-current="page"
                  href="/rent"
                  onClick={() => setTab("rent")}
                >
                  Rent
                </a>
              </li>
              {/* Nav items -- Lend */}
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeTab === "lend" ? "active fw-bold" : ""
                  }`}
                  aria-current="page"
                  href="/lend"
                  onClick={() => setTab("lend")}
                >
                  Lend
                </a>
              </li>
            </ul>
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
                  handleClick={handleLogin}
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
        ) : (
          <nav>
            <div className="nav-logo">
              <img src={ccLogo} alt="Logo" />
            </div>
            <ul className="nav nav-icons">
              <li className="nav-item">
                <button
                  className="btn btn-rounded secondary"
                  onClick={handleLogin}
                >
                  Log in
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-rounded primary"
                  onClick={handleRegister}
                >
                  Register
                </button>
              </li>
              <li className="nav-item nav-language">
                <a className="icon-link" href="">
                  <img src={Language} alt="Language Icon" />
                </a>
                <span>EN</span>
              </li>
            </ul>
          </nav>
        )}
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
