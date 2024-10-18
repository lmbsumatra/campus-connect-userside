import "./adminNavBarStyles.css";
import searchIcon from "../../../assets/images/icons/search.svg";
import userIcon from "../../../assets/images/icons/user-icon.svg";
import { useState } from "react";
const AdminNavBar = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const handleShopUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };
  return (
    <div className="nav nav-container">
      <div className="searchbar">
        <input placeholder="Search here..." />
        <img src={searchIcon} alt="Search icon" className="search-icon" />
      </div>
      <div className="toolbar d-flex">
        <div className="">
          <img src={userIcon} alt="Admin user icon" className="admin icon" />
        </div>
        <div className="">
          <img
            src={userIcon}
            alt="Admin user icon"
            className="admin icon"
            onClick={() => handleShopUserDropdown()}
          />
        </div>
      </div>

      {showUserDropdown && <div className="user-dropdown">admin</div>}
    </div>
  );
};

export default AdminNavBar;
