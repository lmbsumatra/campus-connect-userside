import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ccLogo from "../../../assets/images/navbar/cc-logo.png";
import Notification from "../notif/Notification.jsx";
import Message from "../inbox/Message.jsx";
import UserDropdown from "../dropdown/UserDropdown.jsx";
import LoginSignUp from "../../../pages/public/login-signup/LoginSignup.js";
import searchIcon from "../../../assets/images/navbar/search.svg";
import "./navbarStyles.css";
import { logoutStudent, selectStudentUser } from "../../../redux/auth/studentAuthSlice.js";
import { resetLoginForm } from "../../../redux/login-form/loginFormSlice.js";
import { resetSignupForm } from "../../../redux/signup-form/signupFormSlice.js";

const NavBar2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [refresh, setRefresh] = useState(false);
  const studentUser = useSelector(selectStudentUser);

  useEffect(() => {
    setRefresh((prev) => !prev); // Toggle to force refresh
  }, [studentUser]);


  const [showLoginSignUp, setShowLoginSignUp] = useState(false);
  const [authTab, setAuthTab] = useState("loginTab");
  const [activeTab, setActiveTab] = useState("");
  const [openPopup, setOpenPopup] = useState(null);

  const popupRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case "/shop":
        setActiveTab("Shop");
        break;
      case "/rent":
        setActiveTab("Looking for...");
        break;
      case "/lend":
        setActiveTab("Lend a hand");
        break;
      default:
        setActiveTab("Discover");
    }
  }, [location]);

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
  };

  const handleLogout = () => {
    dispatch(logoutStudent());
    navigate("/");
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setOpenPopup(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={popupRef}>
      <nav className="nav bg-white">
        <div className="nav-content d-block">
          {/* Quick Links */}
          <div className="d-flex">
            <ul className="quick-links m-0 p-0 d-flex">
              {["Privacy Policy", "About us", "Contact", "Ask Question"].map((link) => (
                <li className="link" key={link}>
                  <a
                    className="quick-links active"
                    href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Toolbar */}
          <div className="nav-toolbar d-flex justify-content-between w-100 gap-5">
            {/* Logo */}
            <a className="nav-logo gap-3 text-decoration-none" href="/home">
              <img src={ccLogo} alt="Logo" />
              <span className="fw-bold">Campus Connect</span>
            </a>

            {/* Search Bar */}
            <div className="nav-searchbar w-50">
              <form role="search">
                <div className="input-container">
                  <input
                    className="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                  />
                  <div className="search-icon">
                    <img src={searchIcon} alt="Search icon" />
                  </div>
                </div>
              </form>
            </div>

            {/* Right Section */}
            {studentUser ? (
              <div className="d-flex flex-end gap-2">
                <Notification
                  showNotifications={openPopup === "notifications"}
                  toggleNotifications={() => togglePopup("notifications")}
                />
                <Message
                  showDropdown={openPopup === "messages"}
                  toggleDropdown={() => togglePopup("messages")}
                />
                <UserDropdown
                  showDropdown={openPopup === "dropdown"}
                  toggleDropdown={() => togglePopup("dropdown")}
                  handleLogout={handleLogout}
                />
              </div>
            ) : (
              <div className="d-flex flex-end gap-2">
                <button
                  className="btn btn-rounded secondary"
                  onClick={() => handleAuth("loginTab")}
                >
                  Log in
                </button>
                <button
                  className="btn btn-rounded primary"
                  onClick={() => handleAuth("registerTab")}
                >
                  Register
                </button>
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

      {/* Login/Signup Modal */}
      {showLoginSignUp && (
        <LoginSignUp tab={authTab} show={showLoginSignUp} onClose={closeLoginSignUp} />
      )}
    </div>
  );
};

export default NavBar2;
