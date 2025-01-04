import { Route, Routes, NavLink, Navigate } from "react-router-dom";

import "./profileSidebarStyles.css";

const ProfileSidebar = () => {
  return (
    <div className="profile-sidebar">
      <ul>
        <li>
          <NavLink
            to="dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="my-posts"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            My Posts
          </NavLink>
        </li>
        <li>
          <NavLink
            to="my-listings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            My Listings
          </NavLink>
        </li>
        <li>
          <NavLink
            to="my-for-sale"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            My For Sales
          </NavLink>
        </li>

        <li>
          <NavLink
            to="transactions"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Transactions
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;
