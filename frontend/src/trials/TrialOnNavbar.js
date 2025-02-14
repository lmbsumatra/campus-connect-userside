import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import userIcon from "../assets/images/navbar/user.svg";
import messageIcon from "../assets/images/navbar/message.svg";
import notificationIcon from "../assets/images/navbar/notification.svg";
import cartIcon from "../assets/images/navbar/cart.svg";
import userIconDark from "../assets/images/navbar/userDark.svg";
import messageIconDark from "../assets/images/navbar/messageDark.svg";
import notificationIconDark from "../assets/images/navbar/notificationDark.svg";
import cartIconDark from "../assets/images/navbar/cartDark.svg";
import logo from "../assets/images/navbar/cc-logo-white.svg";
import logoDark from "../assets/images/navbar/cc-logo.png";
import menuIcon from "../assets/images/navbar/menu.svg";
import menuIconDark from "../assets/images/navbar/menu-dark.svg";

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
  const popupRef = useRef(null);
  const searchRef = useRef(null);

  const studentUser = useSelector(selectStudentUser);
  const [activeTab, setActiveTab] = useState("");
  const [openPopup, setOpenPopup] = useState(null);
  const [showLoginSignUp, setShowLoginSignUp] = useState(false);
  const [authTab, setAuthTab] = useState("loginTab");

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const tabMapping = {
      "/shop": "Shop",
      "/rent": "Rent",
      "/lend": "Lend",
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
      popupRef.current &&
      !popupRef.current.contains(event.target) &&
      searchRef.current &&
      !searchRef.current.contains(event.target)
    ) {
      setShowPopUpSearchBarResults(false);
    }
  };

  const handleKeyword = (event) => {
    setKeyword(event.target.value);
    setShowPopUpSearchBarResults(true);
  };

  const handleSearchFocus = () => {
    setShowPopUpSearchBarResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowPopUpSearchBarResults(false), 200);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && keyword.trim()) {
      navigate(`/results?q=${encodeURIComponent(keyword)}&type=all`);
      setShowPopUpSearchBarResults(false);
    }
  };

  const setTab = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab.toLowerCase().replace(/\s+/g, "")}`);
  };

  const togglePopup = (popup) => {
    setOpenPopup((prev) => (prev === popup ? null : popup));
  };

  const handleAuth = (tab) => {
    setAuthTab(tab);
    setShowLoginSignUp(true);
  };

  const closeLoginSignUp = () => {
    dispatch(resetLoginForm(authTab));
    dispatch(resetSignupForm(authTab));
    setShowLoginSignUp(false);
    navigate(location.pathname, { replace: true });
  };

  const handleLogout = () => {
    dispatch(logoutStudent());
    navigate("/");
  };

  return (
    <div ref={popupRef} className={`navbar-container2 ${isDarkTheme ? "dark" : "light"}`}>
      {/* Top Section */}
      <div className="navbar-top">
        <ul>
          {["Privacy Policy", "Terms and Condition"].map((text, index) => (
            <li key={index}>
              <a href={`/${text.toLowerCase().replace(/\s+/g, "-")}`} className={isDarkTheme ? "dark" : "light"}>
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
          <input
            ref={searchRef}
            type="text"
            placeholder="Search"
            className={isDarkTheme ? "dark" : "light"}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onChange={handleKeyword}
            onKeyDown={handleSearchKeyDown}
            name="search-value"
            value={keyword}
          />
        </div>

        {showPopUpSearchBarResults && <TrialOnSearchResults keyword={keyword} />}

        {/* Navigation Icons */}
        <div className="nav-items">
          {studentUser ? (
            <ul>
              <Notification
                icon={isDarkTheme ? notificationIconDark : notificationIcon}
                isDarkTheme={isDarkTheme}
                showNotifications={openPopup === "notifications"}
                toggleNotifications={() => togglePopup("notifications")}
              />
              <Message
                icon={isDarkTheme ? messageIconDark : messageIcon}
                isDarkTheme={isDarkTheme}
                showDropdown={openPopup === "messages"}
                toggleDropdown={() => togglePopup("messages")}
              />
              <UserDropdown
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
                <button className={`btn btn-rounded secondary ${isDarkTheme ? "" : "opac"}`} onClick={() => handleAuth("loginTab")}>
                  Login
                </button>
              </li>
              <li className="register">
                <button className={`btn btn-rounded primary ${isDarkTheme ? "" : "opac"}`} onClick={() => handleAuth("signupTab")}>
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
          {["Discover", "Shop", "Rent", "Lend"].map((text, index) => (
            <li key={index}>
              <button className={`nav-link ${isDarkTheme ? "dark" : "light"} ${activeTab === text ? "active" : ""}`} onClick={() => setTab(text)}>
                {text}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Login/Signup Modal */}
      {showLoginSignUp && <LoginSignUp initialTab={authTab} show={showLoginSignUp} onClose={closeLoginSignUp} />}
    </div>
  );
};

export default TrialOnNavbar;
