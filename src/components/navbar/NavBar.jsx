// modules
import { useState } from "react";

// images, icons
import Logo from "../../assets/images/icons/CC-LOGO-01.svg";
import Bell from "../../assets/images/icons/bell-icon.svg";
import Message from "../../assets/images/icons/message-icon.svg";
import Language from "../../assets/images/icons/en-icon.svg";
import UserIcon from "../../assets/images/icons/user-icon.svg";
import MyRentalsIcon from "../../assets/images/icons/rental.svg";
import MyItemsIcon from "../../assets/images/icons/item.svg";
import MyPostsIcon from "../../assets/images/icons/post.svg";
import LogoutIcon from "../../assets/images/icons/logout.svg";

// style, css
import "./style.css";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  function handleClick() {
    setIsLoggedIn(!isLoggedIn);
  }

  function toggleDropdown() {
    setShowDropdown(!showDropdown);
  }
  function toggleNotifications() {
    setShowNotifications(!showNotifications);
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
                  <span>Listings</span>
                  <i className="fa-solid fa-list"></i>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <span>Posts</span>
                  <i className="fa-solid fa-plus"></i>
                </a>
              </li>
            </ul>
            <ul className="nav nav-icons">
              <li className="nav-item">
                <a className="icon-link" href="#" onClick={toggleNotifications}>
                  <img src={Bell} alt="Notification Icon" />
                </a>
                {showNotifications && (
                  <div class="notifications">
                    <h5>Notifications</h5>
                    <div class="w-100">
                      <a href="#" class="item d-flex align-items-center">
                        <img
                          src={UserIcon}
                          style={{ width: "50px", height: "50px" }}
                        />
                        <img
                          src=""
                          className="sub-icon"
                        />
                        <div >
                          <p>
                            <strong>Hailey Bieber</strong> did
                            something...........
                          </p>
                          <span>3 weeks ago</span>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </li>
              <li className="nav-item">
                <a className="icon-link" href="#" onClick={toggleDropdown}>
                  <img src={Message} alt="Message Icon" />
                </a>
              </li>
              <li className="nav-item dropdown">
                <a className="icon-link" href="#" onClick={toggleDropdown}>
                  <img src={UserIcon} alt="User Icon" />
                </a>

                {showDropdown && (
                  <div className="user-menu">
                    <button className="dropdown-btn">
                      <div className="btn-user-profile">
                        <div>
                          <img
                            src={UserIcon}
                            alt=""
                            style={{ width: "50px", height: "50px" }}
                          />
                        </div>
                        <div>
                          <h6>Profile</h6>
                          <h5>Justin Bieber</h5>
                        </div>
                      </div>
                    </button>
                    <button className="dropdown-btn d-flex align-items-center">
                      <div className="icon">
                        <img src={MyRentalsIcon} alt="" />
                      </div>
                      <h6>My Rentals</h6>
                    </button>
                    <button className="dropdown-btn d-flex align-items-center">
                      <div className="icon">
                        <img src={MyItemsIcon} alt="" />
                      </div>
                      <h6>My Items</h6>
                    </button>
                    <button className="dropdown-btn d-flex align-items-center">
                      <div className="icon">
                        <img src={MyPostsIcon} alt="" />
                      </div>
                      <h6>My Posts</h6>
                    </button>
                    <button
                      className="dropdown-btn d-flex align-items-center"
                      onClick={handleClick}
                    >
                      <div className="icon">
                        <img src={LogoutIcon} alt="" />
                      </div>
                      <h6>Logout</h6>
                    </button>
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
