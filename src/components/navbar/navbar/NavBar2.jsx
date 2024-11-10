import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ccLogo from "../../../assets/images/navbar/cc-logo.png";
import Notification from "../notif/Notification.jsx";
import Message from "../inbox/Message.jsx";
import UserDropdown from "../dropdown/UserDropdown.jsx";
import LoginSignUp from "../../../pages/public/login-signup/LoginSignup.js";
import "./navbarStyles.css";
import { useAuth } from "../../../context/AuthContext.js";

const NavBar2 = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginSignUp, setShowLoginSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [authTab, setAuthTab] = useState("loginTab");
  const [openPopup, setOpenPopup] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { studentUser, logoutStudent } = useAuth();
  const popupRef = useRef(null);
  const role = studentUser?.role;

  useEffect(() => {
    setIsLoggedIn(!!(role === 'student'));
    setShowLoginSignUp(false);
    
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
  }, [location, studentUser]);

  const setTab = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const togglePopup = (popup) => {
    setOpenPopup((prev) => (prev === popup ? null : popup));
  };

  const handleAuth = (tab) => {
    setAuthTab(tab);
    setShowLoginSignUp(true);
  };

  const closeLoginSignUp = () => {
    setShowLoginSignUp(false);
  };

  const handleLogout = () => {
    logoutStudent();
    setIsLoggedIn(false);
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
          <div className="d-flex">
            <ul className="quick-links m-0 p-0 d-flex">
              {["Privacy Policy", "About us", "Contact", "Ask Question"].map(link => (
                <li className="link" key={link}>
                  <a
                    className="quick-links active"
                    href={`/${link}`}
                    onClick={() => setTab(link)}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-toolbar d-flex justify-content-between w-100 gap-5">
            <a className="nav-logo gap-3 text-decoration-none" href="/home">
              <img src={ccLogo} alt="Logo" />
              <span className="fw-bold">Campus Connect</span>
            </a>

            <div className="nav-searchbar w-50">
              <form role="search">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
              </form>
            </div>

            {isLoggedIn ? (
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
                  handleClick={handleAuth}
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

          <div className="d-flex justify-content-center">
            <ul className="nav-links m-0 p-0 d-flex">
              {[
                { name: "Discover", path: "/", icon: "fas fa-binoculars" },
                { name: "Shop", path: "/shop", icon: "fas fa-shopping-cart" },
                { name: "Looking for...", path: "/rent", icon: "fas fa-search" },
                { name: "Lend a hand", path: "/lend", icon: "fas fa-hands-helping" },
              ].map(({ name, path, icon }) => (
                <li className="nav-item" key={name}>
                  <a
                    className={`nav-link ${activeTab === name ? "active fw-bold" : ""}`}
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

      {showLoginSignUp && (
        <div className="">
          <LoginSignUp tab={authTab} show={showLoginSignUp} onClose={closeLoginSignUp} />
        </div>
      )}
    </div>
  );
};

export default NavBar2;
