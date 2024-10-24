import React, { useState } from "react";
import "./adminSidebarStyles.css";
import arrowDown from "../../../assets/images/icons/arrow-down.svg";
import expandArrow from "../../../assets/images/icons/expandIcon.svg";
import { useNavigate } from "react-router-dom";
import ccLogo from "../../../assets/images/navbar/cc-logo.png";
import dashboardIcon from "../../../assets/images/admin/sidebar/dashboard.svg";

const AdminSidebar = () => {
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [expandSidebar, setExpandSidebar] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleExpandTab = (tab) => {
    if (activeTab === tab) {
      setOpenTabs((prev) =>
        prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab]
      );
      setActiveTab(null);
      navigate("/dashboard");
    } else {
      setActiveTab(tab);
      setActiveSubTab(null);
      setOpenTabs((prev) => [...prev.filter((t) => t !== tab), tab]);
    }
  };

  const handleActiveTab = ([tab, path]) => {
    setActiveSubTab(tab);
    setActiveTab(tab);
    navigate(path);
  };

  const handleExpandSidebar = () => {
    setExpandSidebar((prev) => !prev);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!expandSidebar) {
      setIsHovered(false);
    }
  };

  return (
    <div
      className={`admin sidebar ${expandSidebar ? "expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="admin-header">
        <img src={ccLogo} alt="Campus Connect Logo" />
        {(expandSidebar || isHovered) && <span>Admin</span>}
      </div>
      {/* Tabs */}
      <div className="tabs">
        <div onClick={handleExpandSidebar}>
          <img
            src={expandArrow}
            alt="Expand sidebar button"
            className="btn-expand"
          />
        </div>
        {/* Dashboard tab */}
        <div
          className={`tab ${activeTab === "dashboard" ? "active" : ""} ${
            openTabs.includes("dashboard") ? "expand" : ""
          }`}
          onClick={() => handleActiveTab(["dashboard", "/admin/dashboard"])}
        >
          <img
            src={dashboardIcon}
            alt="Admin dashboard icon"
            className="sidebar-icon"
          />
          {(expandSidebar || isHovered) && "Dashboard"}
        </div>

        {/* Users tab */}
        <div>
          <div
            className={`tab ${activeTab === "users" ? "active" : ""} ${
              openTabs.includes("users") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["users", "/admin/users"])}
          >
            <img
              src={dashboardIcon}
              alt="Admin dashboard icon"
              className="sidebar-icon"
            />
            {(expandSidebar || isHovered) && "Users Management"}
            <img
              src={arrowDown}
              className="expand-tab"
              onClick={() => handleExpandTab("users")}
              alt="Expand tab button"
            />
          </div>
          <div
            className={`sub-tabs ${openTabs.includes("users") ? "show" : ""}`}
          >
            <div
              className={`sub-tab ${
                activeSubTab === "usersOverview" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab(["usersOverview", "/admin/user-overview"])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "usersOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Users Overview</>}
            </div>
            <div
              className={`sub-tab ${
                activeSubTab === "usersVerification" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab([
                  "usersVerification",
                  "/admin/user-verification",
                ])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "usersVerification" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>User Verification</>}
            </div>
          </div>
        </div>

        {/* Listings tab */}
        <div>
          <div
            className={`tab ${activeTab === "listings" ? "active" : ""} ${
              openTabs.includes("listings") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["listings", "/admin/listings"])}
          >
            <img
              src={dashboardIcon}
              alt="Admin dashboard icon"
              className="sidebar-icon"
            />
            {(expandSidebar || isHovered) && "Listing Management"}
            <img
              src={arrowDown}
              className="expand-tab"
              onClick={() => handleExpandTab("listings")}
              alt="Expand tab button"
            />
          </div>
          <div
            className={`sub-tabs ${
              openTabs.includes("listings") ? "show" : ""
            }`}
          >
            <div
              className={`sub-tab ${
                activeSubTab === "listingsOverview" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab(["listingsOverview", "/admin/listing-overview"])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "listingsOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Listing Overview</>}
            </div>
          </div>
        </div>

        {/* Posts tab */}
        <div>
          <div
            className={`tab ${activeTab === "posts" ? "active" : ""} ${
              openTabs.includes("posts") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["posts", "/admin/posts"])}
          >
            <img
              src={dashboardIcon}
              alt="Admin dashboard icon"
              className="sidebar-icon"
            />
            {(expandSidebar || isHovered) && "Posts Management"}
            <img
              src={arrowDown}
              className="expand-tab"
              onClick={() => handleExpandTab("posts")}
              alt="Expand tab button"
            />
          </div>
          <div
            className={`sub-tabs ${openTabs.includes("posts") ? "show" : ""}`}
          >
            <div
              className={`sub-tab ${
                activeSubTab === "postsOverview" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab(["postsOverview", "/admin/post-overview"])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "postsOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Post Overview</>}
            </div>
          </div>
        </div>
        
        {/* Sales tab */}
        <div>
          <div
            className={`tab ${activeTab === "sales" ? "active" : ""} ${
              openTabs.includes("sales") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["sales", "/admin/sales"])}
          >
            <img
              src={dashboardIcon}
              alt="Admin dashboard icon"
              className="sidebar-icon"
            />
            {(expandSidebar || isHovered) && "For Sale Management"}
            <img
              src={arrowDown}
              className="expand-tab"
              onClick={() => handleExpandTab("sales")}
              alt="Expand tab button"
            />
          </div>
          <div
            className={`sub-tabs ${openTabs.includes("sales") ? "show" : ""}`}
          >
            <div
              className={`sub-tab ${
                activeSubTab === "salesOverview" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab(["salesOverview", "/admin/sales-overview"])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "salesOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Sales Overview</>}
            </div>
          </div>
        </div>

        {/* Settings tab */}
        <div
          className={`tab ${activeTab === "settings" ? "active" : ""} ${
            openTabs.includes("settings") ? "expand" : ""
          }`}
          onClick={() => handleActiveTab(["settings", "/admin/settings"])}
        >
          <img
            src={dashboardIcon}
            alt="Admin dashboard icon"
            className="sidebar-icon"
          />
          {(expandSidebar || isHovered) && "Settings"}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
