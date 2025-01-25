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

import "./new2.css";

const TrialOnNavbar = () => {
  const theme = "light";
  const isDarkTheme = theme === "dark";

  // Define icons based on the theme
  const icons = isDarkTheme
    ? [cartIconDark, notificationIconDark, messageIconDark, userIconDark]
    : [cartIcon, notificationIcon, messageIcon, userIcon];

  return (
    <div className={`navbar-container2 ${isDarkTheme ? "dark" : "light"}`}>
      {/* Top Section */}
      <div className="navbar-top">
        <ul>
          {["Privacy Policy", "Terms of Service"].map((text, index) => (
            <li key={index}>
              <a
                href={`#${text.toLowerCase().replace(/\s+/g, "")}`}
                className={isDarkTheme ? "dark" : "light"}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Section */}
      <div className="navbar-main">
        {/* Logo */}
        <div className="nav-logo">
          <img src={isDarkTheme ? logoDark : logo} alt="RentTUPeers logo" />
          <span className={isDarkTheme ? "dark" : "light"}>RenTUPeers</span>
        </div>

        {/* Search Bar */}
        <div className="nav-searchbar">
          <input
            type="text"
            placeholder="Search"
            className={isDarkTheme ? "dark" : "light"}
          />
        </div>

        {/* Navigation Items */}
        <div className="nav-items">
          <ul>
            {icons.map((icon, index) => (
              <li key={index} className={`icon-wrapper ${isDarkTheme ? "dark" : "light"}`}>
                <img
                  src={icon}
                  alt={`${icon.split("/").pop().split(".")[0]} icon`}
                />
              </li>
            ))}
            <li>
              <button
                className={`btn btn-rounded primary ${
                  isDarkTheme ? "" : "opac"
                }`}
              >
                Login
              </button>
            </li>
            <li>
              <button
                className={`btn btn-rounded secondary ${
                  isDarkTheme ? "" : "opac"
                }`}
              >
                Register
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="navbar-bottom">
        <ul>
          {["Discover", "Shop", "Rent", "Lend"].map((text, index) => (
            <li key={index}>
              <a
                href={`/${text.toLowerCase()}`}
                className={isDarkTheme ? "dark" : "light"}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrialOnNavbar;
