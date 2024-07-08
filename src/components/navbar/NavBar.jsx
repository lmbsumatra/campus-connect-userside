// modules
import { useState } from "react";

// images, icons
import Logo from "../../assets/images/icons/CC-LOGO-01.svg";
import Bell from "../../assets/images/icons/bell-icon.svg";
import Message from "../../assets/images/icons/message-icon.svg";
import Language from "../../assets/images/icons/en-icon.svg";
import UserIcon from "../../assets/images/icons/user-icon.svg"; // Add user icon

// style, css
import "./style.css";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(true);

  function handleClick() {
    setIsLoggedIn(!isLoggedIn);
  }

  function toggleDropdown() {
    setShowDropdown(!showDropdown);
    console.log("hi");
  }

  return (
    <div className="container fs-6">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
      <div className="nav-content">
        {/* logo */}
        <div className="nav-logo">
          <img src={Logo} alt="Logo" />
        </div>

        {isLoggedIn ? (
          <>
            <ul className="nav custom-nav-underline">
              <li className="nav-item">
                <a
                  className="nav-link active fw-bold"
                  aria-current="page"
                  href="#"
                >
                  <span className="">Home</span>
                  <i className="fa-solid fa-house"></i>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <span>Borrowing Posts</span>
                  <i className="fa-solid fa-list"></i>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <span>Borrowing Posts</span>
                  <i className="fa-solid fa-plus"></i>
                </a>
              </li>
            </ul>
            <ul className="nav nav-icons">
              <li className="nav-item">
                <a className="icon-link" href="#">
                  <img src={Bell} alt="Notification Icon" />
                </a>
              </li>
              <li className="nav-item">
                <a className="icon-link" href="#">
                  <img src={Message} alt="Message Icon" />
                </a>
              </li>
              <li className="nav-item dropdown">
                <a className="icon-link" href="#" onClick={toggleDropdown}>
                  <img src={UserIcon} alt="User Icon" />
                </a>
                {showDropdown && (
                  <div className="user-menu">
                    <button className="dropdown-btn">Profile</button>
                    <button className="dropdown-btn">Settings</button>
                    <button className="dropdown-btn" onClick={handleClick}>Logout</button>
                  </div>
                )}
              </li>
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
            {/* personal links */}
            <ul className="nav nav-icons">
              <li className="nav-item">
                <button
                  className="btn btn-secondary no-fill"
                  onClick={handleClick}
                >
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
