import "./adminNavBarStyles.css";
import searchIcon from "../../../assets/images/icons/search.svg"
const AdminNavBar = () => {
  return (
    <div className="nav nav-container">
      <div className="searchbar">
        <input placeholder="Search here..." />
        <img src={searchIcon} alt="Search icon" className="search-icon"/>
      </div>
      <div className="toolbar d-flex">
        <div className="notif">notif</div>
        <div className="admin">icon</div>
      </div>
    </div>
  );
};

export default AdminNavBar;
