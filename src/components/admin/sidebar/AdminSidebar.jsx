import React, { useState } from "react";
import "./adminSidebarStyles.css";
import arrowDown from "../../../assets/images/icons/arrow-down.svg";
import expandArrow from "../../../assets/images/icons/expandIcon.svg";
import { useNavigate } from "react-router-dom";
import ccLogo from "../../../assets/images/navbar/cc-logo.png";

const AdminSidebar = () => {
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [expandSidebar, setExpandSidebar] = useState(false);
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
    setExpandSidebar(!expandSidebar);
  };

  return (
    <div className={`admin sidebar ${expandSidebar ? "expanded" : ""}`}>
      <div className="admin-header">
        <img src={ccLogo} alt="Campus Connect Logo" />
        <span>Admin</span>
      </div>
      {/* Tabs */}
      <div className="tabs">
        <div onClick={() => handleExpandSidebar()}>
          <img
            src={expandArrow}
            alt="Expand sidebar button"
            className="btn-expand"
          />
        </div>
        <div
          className={`tab ${activeTab === "dashboard" ? "active" : ""} ${
            openTabs.includes("dashboard") ? "expand" : ""
          }`}
          onClick={() => handleActiveTab(["dashboard", "/admin/dashboard"])}
        >
          Dashboard
        </div>

        {/* Users tab */}
        <div>
          <div
            className={`tab ${activeTab === "users" ? "active" : ""} ${
              openTabs.includes("users") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["users", "/admin/users"])}
          >
            Users Management
            <img
              src={arrowDown}
              className="expand-button"
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
              Users Overview
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
              Users Verification
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
            Listing Management
            <img
              src={arrowDown}
              className="expand-button"
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
              Listings Overview
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
            Posts Management
            <img
              src={arrowDown}
              className="expand-button"
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
                handleActiveTab(["postOverview", "/admin/post-overview"])
              }
            >
              Posts Overview
            </div>
          </div>
        </div>

        {/* Sale tab */}
        <div>
          <div
            className={`tab ${activeTab === "sales" ? "active" : ""} ${
              openTabs.includes("sales") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["sales", "/admin/posts"])}
          >
            For Sale Management
            <img
              src={arrowDown}
              className="expand-button"
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
              Sales Overview
            </div>
          </div>
        </div>

        {/* Transaction tab */}
        <div>
          <div
            className={`tab ${activeTab === "transactions" ? "active" : ""} ${
              openTabs.includes("transactions") ? "expand" : ""
            }`}
            onClick={() =>
              handleActiveTab(["transactions", "/admin/transactions"])
            }
          >
            Transaction Management
          </div>
        </div>

        {/* Reports tab */}
        <div>
          <div
            className={`tab ${activeTab === "reports" ? "active" : ""} ${
              openTabs.includes("reports") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["reports", "/admin/reports"])}
          >
            Reports Management
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
