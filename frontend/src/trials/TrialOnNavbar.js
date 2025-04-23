import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import userIcon from "../assets/images/navbar/user.svg";
import messageIcon from "../assets/images/navbar/message.svg";
import notificationIcon from "../assets/images/navbar/notification.svg";
import userIconDark from "../assets/images/navbar/userDark.svg";
import messageIconDark from "../assets/images/navbar/messageDark.svg";
import notificationIconDark from "../assets/images/navbar/notificationDark.svg";

import logo from "../assets/images/navbar/cc-logo-white.svg";
import logoDark from "../assets/images/navbar/cc-logo.png";

import LoginSignUp from "../pages/public/login-signup/LoginSignup.js";

import {
  logoutStudent,
  selectStudentUser,
} from "../redux/auth/studentAuthSlice.js";
import { resetLoginForm } from "../redux/login-form/loginFormSlice.js";
import { resetSignupForm } from "../redux/signup-form/signupFormSlice.js";

import "./new2.css";
import Notification from "../components/navbar/notif/Notification.jsx";
import Message from "../components/navbar/inbox/Message.jsx";
import UserDropdown from "../components/navbar/dropdown/UserDropdown.jsx";
import TrialOnSearchResults from "./TrialOnSearchResults.jsx";

const TrialOnNavbar = ({ theme = "dark" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkTheme = theme === "dark";

  const [keyword, setKeyword] = useState("");
  const [showPopUpSearchBarResults, setShowPopUpSearchBarResults] =
    useState(false);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const messageRef = useRef(null);
  const userDropdownRef = useRef(null);

  const studentUser = useSelector(selectStudentUser);
  const [activeTab, setActiveTab] = useState("");
  const [openPopup, setOpenPopup] = useState(null);
  const [showLoginSignUp, setShowLoginSignUp] = useState(false);
  const [authTab, setAuthTab] = useState("loginTab");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const tabMapping = {
      "/shop": "Shop",
      "/rent": "Rent",
      "/lookingfor": "Looking for...",
      "/discover": "Discover",
    };
    setActiveTab(tabMapping[path] || "Discover");
  }, [location.pathname]);

  useEffect(() => {
    if (location.state?.showLogin) {
      setAuthTab(location.state.authTab || "loginTab");
      setShowLoginSignUp(true);
    }
  }, [location.state]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (
      (notificationRef.current &&
        notificationRef.current.contains(event.target)) ||
      (messageRef.current && messageRef.current.contains(event.target)) ||
      (userDropdownRef.current &&
        userDropdownRef.current.contains(event.target)) ||
      (searchRef.current && searchRef.current.contains(event.target))
    ) {
      return; // Clicked inside the active popup, do nothing
    }

    if (
      event.target.closest("#notif-popup") ||
      event.target.closest("#message-popup") ||
      event.target.closest("#user-dropdown-popup") ||
      event.target.closest("#search-results-popup")
    ) {
      return; // Clicked inside a popup, do nothing
    }

    setOpenPopup(null);
    setShowPopUpSearchBarResults(false);
  };

  const handleKeyword = (event) => {
    setKeyword(event.target.value);
    setShowPopUpSearchBarResults(true);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && keyword.trim()) {
      navigate(`/results?q=${encodeURIComponent(keyword)}&type=all`);
      setShowPopUpSearchBarResults(false);
    }
  };

  const setTab = (tab) => {
    setActiveTab(tab);
    const formattedTab = tab
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/\.{3}/g, "");
    navigate(`/${formattedTab}`);
  };

  const clearSearch = () => {
    setKeyword("");
    setShowPopUpSearchBarResults(false);

    // Clear query parameter from URL
    const currentPath = location.pathname;
    const hasQueryParam = location.search.includes("q=");

    if (hasQueryParam) {
      // Keep only non-search related query params if they exist
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete("q");

      // If there are other query params, keep them
      const remainingParams = searchParams.toString();
      const newPath = remainingParams
        ? `${currentPath}?${remainingParams}`
        : currentPath;

      navigate(newPath, { replace: true });
    }

    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const togglePopup = (popup) => {
    setOpenPopup((prev) => (prev === popup ? null : popup));
  };

  const handleAuth = (tab) => {
    setAuthTab(tab);
    setShowLoginSignUp(true);
  };

  const handleSearchFocus = () => {
    setShowPopUpSearchBarResults(true);
    setIsSearchFocused(true);
  };

  const closeLoginSignUp = () => {
    dispatch(resetLoginForm(authTab));
    dispatch(resetSignupForm(authTab));
    setShowLoginSignUp(false);
    navigate(location.pathname, { replace: true });
  };

  const handleLogout = () => {
    // console.log("clicked");
    dispatch(logoutStudent());
    navigate(0);
  };

  return (
    <div className={`navbar-container2 ${isDarkTheme ? "dark" : "light"}`}>
      {/* Top Section */}
      <div className="navbar-top">
        <ul>
          {["Privacy Policy", "Terms and Condition"].map((text, index) => (
            <li key={index}>
              <a
                href={`/${text.toLowerCase().replace(/\s+/g, "-")}`}
                className={isDarkTheme ? "dark" : "light"}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-main">
        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate("/")}>
          <img src={isDarkTheme ? logoDark : logo} alt="RentTUPeers logo" />
          <span className={isDarkTheme ? "dark" : "light"}>RenTUPeers</span>
        </div>

        {/* Search Bar */}
        <div className="nav-searchbar">
          <div className="search-wrapper">
            <i
              className={`fas fa-search ${
                isDarkTheme ? "light-icon" : "dark-icon"
              }`}
            ></i>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search"
              className={isDarkTheme ? "dark" : "light"}
              onChange={handleKeyword}
              onKeyDown={handleSearchKeyDown}
              name="search-value"
              value={keyword}
              onFocus={handleSearchFocus}
              onBlur={() => setIsSearchFocused(false)}
            />
            {keyword && (
              <button
                className={`clear-search-btn ${isDarkTheme ? "dark" : "light"}`}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}{" "}
          </div>
        </div>

        {showPopUpSearchBarResults && (
          <TrialOnSearchResults keyword={keyword} />
        )}

        {/* Navigation Icons */}
        <div className={`nav-items ${isSearchFocused ? "hidden" : ""}`}>
          {studentUser ? (
            <ul>
              <Notification
                ref={notificationRef}
                icon={isDarkTheme ? notificationIconDark : notificationIcon}
                isDarkTheme={isDarkTheme}
                showNotifications={openPopup === "notifications"}
                toggleNotifications={() => togglePopup("notifications")}
              />
              <Message
                ref={messageRef}
                icon={isDarkTheme ? messageIconDark : messageIcon}
                isDarkTheme={isDarkTheme}
                showDropdown={openPopup === "messages"}
                toggleDropdown={() => togglePopup("messages")}
              />
              <UserDropdown
                ref={userDropdownRef}
                icon={isDarkTheme ? userIconDark : userIcon}
                isDarkTheme={isDarkTheme}
                showDropdown={openPopup === "dropdown"}
                toggleDropdown={() => togglePopup("dropdown")}
                handleLogout={handleLogout}
              />
            </ul>
          ) : (
            <ul>
              <li className="login">
                <button
                  className={`btn btn-rounded secondary ${
                    isDarkTheme ? "" : "opac"
                  }`}
                  onClick={() => handleAuth("loginTab")}
                >
                  Login
                </button>
              </li>
              <li className="register">
                <button
                  className={`btn btn-rounded primary ${
                    isDarkTheme ? "" : "opac"
                  }`}
                  onClick={() => handleAuth("signupTab")}
                >
                  Register
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="navbar-bottom">
        <ul className={isDarkTheme ? "dark" : "light"}>
          {["Discover", "Shop", "Rent", "Looking for..."].map((text, index) => (
            <li key={index}>
              <button
                className={`nav-link ${isDarkTheme ? "dark" : "light"} ${
                  activeTab === text ? "active" : ""
                }`}
                onClick={() => setTab(text)}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Login/Signup Modal */}
      {showLoginSignUp && (
        <LoginSignUp
          initialTab={authTab}
          show={showLoginSignUp}
          onClose={closeLoginSignUp}
        />
      )}
    </div>
  );
};

export default TrialOnNavbar;
