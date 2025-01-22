import userIcon from "../assets/images/navbar/user.svg";
import messageIcon from "../assets/images/navbar/message.svg";
import notificationIcon from "../assets/images/navbar/notification.svg";
import cartIcon from "../assets/images/navbar/cart.svg";
import logo from "../assets/images/navbar/cc-logo-white.svg";

import "./new.css";

const TrialOnNavbar = () => {
  return (
    <div className="navbar2">
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
        </ul>
      </div>
    </div>
  );
};

export default TrialOnNavbar;
