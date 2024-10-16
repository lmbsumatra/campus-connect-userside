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

const NavBar2 = () => {
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
    if (path === "/shop") {
      setActiveTab("Shop");
    } else if (path === "/rent") {
      setActiveTab("Looking for...");
    } else if (path === "/lend") {
      setActiveTab("Lend a hand");
    } else {
      setActiveTab("Discover");
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
    <div className="bg-dark">
      <nav className="nav bg-white">
        <div className="nav-content d-block">
          {/* Quick Links */}
          <div className="d-flex">
            <ul className="quick-links m-0 p-0 d-flex">
              {["Privacy Policy", "About us", "Contact", "Ask Question"].map(
                (link) => (
                  <li className="link" key={link}>
                    <a
                      className={`quick-links active `}
                      aria-current="page"
                      href={`/${link}`}
                      onClick={() => setTab(link)}
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="nav-toolbar d-flex justify-content-between w-100 gap-5">
            {/* Logo */}
            <div className="nav-logo gap-3">
              <img src={ccLogo} className="" />
              <span className="fw-bold ">Campus Connect</span>
            </div>

            {/* Search bar */}
            <div className="nav-searchbar w-50">
              <form class="" role="search">
                <input
                  class="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
              </form>
            </div>

            {/* Login, Sign up, Personal Links*/}
            {!isLoggedIn ? (
              <div className="d-flex flex-end gap-2">
                <Notification
                  showNotifications={showNotifications}
                  toggleNotifications={toggleNotifications}
                />
                <Message
                  showDropdown={showMessages}
                  toggleDropdown={toggleMessages}
                />
                <UserDropdown
                  showDropdown={showDropdown}
                  toggleDropdown={toggleDropdown}
                  handleClick={handleAuth}
                />
              </div>
            ) : (
              <div className="d-flex flex-end gap-2">
                <button className="btn btn-rounded secondary">Log in</button>
                <button className="btn btn-rounded primary">Register</button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="d-flex justify-content-center">
            <ul className="nav-links m-0 p-0 d-flex">
              {[
                { name: "Discover", path: "/", icon: "fas fa-binoculars" },
                { name: "Shop", path: "/shop", icon: "fas fa-shopping-cart" },
                {
                  name: "Looking for...",
                  path: "/rent",
                  icon: "fas fa-search",
                },
                {
                  name: "Lend a hand",
                  path: "/lend",
                  icon: "fas fa-hands-helping",
                },
              ].map(({ name, path, icon }) => (
                <li className="nav-item" key={name}>
                  <a
                    className={`nav-link ${
                      activeTab === name ? "active fw-bold" : ""
                    }`}
                    aria-current={activeTab === name ? "page" : undefined}
                    href={path}
                    onClick={() => setTab(name)}
                  >
                    <i className={icon}></i> {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar2;
