import React, { useEffect, useState } from "react";
import "./adminSidebarStyles.css";
import arrowDown from "../../../assets/images/icons/arrow-down.svg";
import expandArrow from "../../../assets/images/icons/expandIcon.svg";
import { useLocation, useNavigate } from "react-router-dom";
import ccLogo from "../../../assets/images/navbar/cc-logo.png";
import dashboardIcon from "../../../assets/images/admin/sidebar/dashboard.svg";

const AdminSidebar = () => {
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [expandSidebar, setExpandSidebar] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Default to dashboard
    setActiveTab("dashboard");
    setActiveSubTab(null);

    if (path.includes("/admin/users")) {
      setActiveTab("users");

      if (path.includes("/admin/users/user-overview")) {
        setActiveSubTab("usersOverview");
      } else if (path.includes("user-verification")) {
        setActiveSubTab("usersVerification");
      }
    } else if (path.includes("/admin/listings")) {
      setActiveTab("listings");

      if (path.includes("listing-overview")) {
        setActiveSubTab("listingsOverview");
      } else if (path.includes("listing-approval")) {
        setActiveSubTab("listingApproval");
      }
    } else if (path.includes("/admin/posts")) {
      setActiveTab("posts");

      if (path.includes("post-overview")) {
        setActiveSubTab("postsOverview");
      } else if (path.includes("post-approval")) {
        setActiveSubTab("postsApproval");
      }
    } else if (path.includes("/admin/sales")) {
      setActiveTab("sales");
      setActiveSubTab("salesOverview");
    } else if (path.includes("/admin/reports")) {
      setActiveTab("reports");

      if (path.includes("report-overview")) {
        setActiveSubTab("reportsOverview");
      }
    } else if (path.includes("/admin/transactions")) {
      setActiveTab("transactions");
      if (path.includes("overview")) {
        setActiveSubTab("transactionsOverview");
      }
    } else if (path.includes("/admin/logs")) {
      setActiveTab("logs");
    } else if (path.includes("/admin/settings")) {
      setActiveTab("settings");
    }
  }, [location]);

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
        <a href="/admin/dashboard">
          <img src={ccLogo} alt="Campus Connect Logo" />
          {(expandSidebar || isHovered) && "Admin"}
        </a>
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
                handleActiveTab(["usersOverview", "/admin/users/user-overview"])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "usersOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Users Overview</>}
            </div>
            {/* <div
              className={`sub-tab ${
                activeSubTab === "usersVerification" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab([
                  "usersVerification",
                  "/admin/users/user-verification",
                ])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "usersVerification" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>User Verification</>}
            </div> */}
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
                handleActiveTab([
                  "listingsOverview",
                  "/admin/listings/listing-overview",
                ])
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

        {/* Posts Management Tab */}
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
                handleActiveTab(["postsOverview", "/admin/posts/post-overview"])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "postsOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Posts Overview</>}
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
                handleActiveTab([
                  "salesOverview",
                  "/admin/sales/sales-overview",
                ])
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

        {/* Reports Management Tab */}
        <div>
          <div
            className={`tab ${activeTab === "reports" ? "active" : ""} ${
              openTabs.includes("reports") ? "expand" : ""
            }`}
            onClick={() => handleActiveTab(["reports", "/admin/reports"])}
          >
            <img
              src={dashboardIcon}
              alt="Reports icon"
              className="sidebar-icon"
            />
            {(expandSidebar || isHovered) && "Reports Management"}
            <img
              src={arrowDown}
              className="expand-tab"
              onClick={() => handleExpandTab("reports")}
              alt="Expand tab button"
            />
          </div>
          <div
            className={`sub-tabs ${openTabs.includes("reports") ? "show" : ""}`}
          >
            <div
              className={`sub-tab ${
                activeSubTab === "reportsOverview" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab([
                  "reportsOverview",
                  "/admin/reports/report-overview",
                ])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "reportsOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Reports Overview</>}
            </div>
          </div>
        </div>

        {/* Transaction Management Tab */}
        <div>
          <div
            className={`tab ${activeTab === "transactions" ? "active" : ""} ${
              openTabs.includes("transactions") ? "expand" : ""
            }`}
            onClick={() =>
              handleActiveTab(["transactions", "/admin/transactions"])
            }
          >
            <img
              src={dashboardIcon}
              alt="Transactions icon"
              className="sidebar-icon"
            />
            {(expandSidebar || isHovered) && "Transaction Management"}
            <img
              src={arrowDown}
              className="expand-tab"
              onClick={() => handleExpandTab("transactions")}
              alt="Expand tab button"
            />
          </div>
          <div
            className={`sub-tabs ${
              openTabs.includes("transactions") ? "show" : ""
            }`}
          >
            <div
              className={`sub-tab ${
                activeSubTab === "transactionsOverview" ? "active" : ""
              }`}
              onClick={() =>
                handleActiveTab([
                  "transactionsOverview",
                  "/admin/transactions/overview",
                ])
              }
            >
              <div
                className={`indication ${
                  activeSubTab === "transactionsOverview" ? "active" : ""
                }`}
              ></div>
              {(expandSidebar || isHovered) && <>Transactions Overview</>}
            </div>
          </div>
        </div>

        {/* Logs Dashboard Tab */}
        <div
          className={`tab ${activeTab === "logs" ? "active" : ""} ${
            openTabs.includes("logs") ? "expand" : ""
          }`}
          onClick={() => handleActiveTab(["logs", "/admin/logs"])}
        >
          <img
            src={dashboardIcon} // Replace with a log icon if available
            alt="Logs dashboard icon"
            className="sidebar-icon"
          />
          {(expandSidebar || isHovered) && "Audit Logs"}
        </div>

        <div
          className={`tab ${activeTab === "generate-report" ? "active" : ""} ${
            openTabs.includes("generate-report") ? "expand" : ""
          }`}
          onClick={() =>
            handleActiveTab(["generate-report", "/admin/generate-report"])
          }
        >
          <img
            src={dashboardIcon}
            alt="Admin dashboard icon"
            className="sidebar-icon"
          />
          {(expandSidebar || isHovered) && "Generate Report"}
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
