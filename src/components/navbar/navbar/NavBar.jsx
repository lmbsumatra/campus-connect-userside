import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../../../assets/images/icons/CC-LOGO-01.svg";
import Language from "../../../assets/images/icons/en-icon.svg";
import Notification from '../notif/Notification.jsx';
import Message from '../inbox/Message.jsx';
import UserDropdown from '../dropdown/UserDropdown.jsx';
import './style.css';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [showMessages, setShowMessages] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const navigate = useNavigate();

  function setTab(tab) {
    setActiveTab(tab);
    navigate(`/${tab}`);
  }

  function handleClick() {
    setIsLoggedIn(!isLoggedIn);
  }

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
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <div className="nav-content">
        <div className="nav-logo">
          <img src={Logo} alt="Logo" />
        </div>

        {isLoggedIn ? (
          <>
            <ul className="nav custom-nav-underline">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "home" ? "active fw-bold" : ""}`}
                  aria-current="page"
                  href="/home"
                  onClick={() => setTab("home")}
                >
                  <span>Home</span>
                  <i className="fa-solid fa-house"></i>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "listings" ? "active fw-bold" : ""}`}
                  href="/listings"
                  onClick={() => setTab("listings")}
                >
                  <span>Listings</span>
                  <i className="fa-solid fa-list"></i>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "posts" ? "active fw-bold" : ""}`}
                  href="/posts"
                  onClick={() => setTab("posts")}
                >
                  <span>Posts</span>
                  <i className="fa-solid fa-plus"></i>
                </a>
              </li>
            </ul>
            <ul className="nav nav-icons">
              <Notification showNotifications={showNotifications} toggleNotifications={toggleNotifications} />
              <Message showDropdown={showMessages} toggleDropdown={toggleMessages} />
              <UserDropdown showDropdown={showDropdown} toggleDropdown={toggleDropdown} handleClick={handleClick} />
              <li className="nav-item nav-language">
                <a className="icon-link" href="#">
                  <img src={Language} alt="Language Icon" />
                </a>
                <span>EN</span>
              </li>
            </ul>
          </>
        ) : (
          <div>
            <ul className="nav nav-icons">
              <li className="nav-item">
                <button className="btn btn-secondary no-fill" onClick={handleClick}>
                  <span className="text-gradient fw-bold">Log in</span>
                </button>
              </li>
              <li className="nav-item">
                <button className="btn btn-secondary filled">
                  <span className="text-gradient fw-bold">Register</span>
                </button>
              </li>
              <li className="nav-item nav-language">
                <a className="icon-link" href="#">
                  <img src={Language} alt="Language Icon" />
                </a>
                <span>EN</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
