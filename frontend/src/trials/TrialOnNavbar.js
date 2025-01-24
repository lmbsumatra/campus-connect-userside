import userIcon from "../assets/images/navbar/user.svg";
import messageIcon from "../assets/images/navbar/message.svg";
import notificationIcon from "../assets/images/navbar/notification.svg";
import cartIcon from "../assets/images/navbar/cart.svg";
import logo from "../assets/images/navbar/cc-logo-white.svg";

import "./new.css";

const TrialOnNavbar = () => {
  return (
    <div className="navbar-container">
      {/* Top Section */}
      <div className="navbar-top">
        <ul>
          <li>
            <a href="#privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="#terms">Terms of Service</a>
          </li>
        </ul>
      </div>

      {/* Middle Section */}
      <div className="navbar-main">
        <div className="nav-logo">
          <img src={logo} alt="RentTUPeers logo" />
          <span>RenTUPeers</span>
        </div>

        <div className="nav-searchbar">
          <input type="text" placeholder="Search" />
        </div>

        <div className="nav-items">
          <ul className="d-flex">
            <li>
              <img src={cartIcon} alt="Cart icon" />
            </li>
            <li>
              <img src={notificationIcon} alt="Notification icon" />
            </li>
            <li>
              <img src={messageIcon} alt="Message icon" />
            </li>
            <li>
              <img src={userIcon} alt="User icon" />
            </li>
            <li>
              <button className="btn btn-rounded primary opac">Login</button>
            </li>
            <li>
              <button className="btn btn-rounded secondary opac">Register</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="navbar-bottom">
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TrialOnNavbar;
