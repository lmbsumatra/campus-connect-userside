import { NavLink, useLocation } from "react-router-dom";
import "./profileSidebarStyles.css";

const ProfileSidebar = () => {
  const location = useLocation();

  const isActiveLink = (path) => location.pathname.startsWith(path);

  return (
    <div className="profile-sidebar">
      <ul>
        <li>
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              isActive || isActiveLink("/profile/dashboard") ? "active" : ""
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="my-posts"
            className={({ isActive }) =>
              isActive || isActiveLink("/profile/my-posts") ? "active" : ""
            }
          >
            My Posts
          </NavLink>
        </li>
        <li>
          <NavLink
            to="my-listings"
            className={({ isActive }) =>
              isActive || isActiveLink("/profile/my-listings") ? "active" : ""
            }
          >
            My Listings
          </NavLink>
        </li>
        <li>
          <NavLink
            to="my-for-sale"
            className={({ isActive }) =>
              isActive || isActiveLink("/profile/my-for-sale") ? "active" : ""
            }
          >
            My For Sale
          </NavLink>
        </li>
        <li>
          <NavLink
            to="transactions/renter/requests"
            className={({ isActive }) =>
              isActive || isActiveLink("/profile/transactions") ? "active" : ""
            }
          >
            Transactions
          </NavLink>
        </li>
        <li>
          <NavLink
            to="reviews"
            className={({ isActive }) =>
              isActive || isActiveLink("/profile/reviews") ? "active" : ""
            }
          >
            Reviews
          </NavLink>
        </li>
        <li>
          <NavLink
            to="transaction-reports"
            className={({ isActive }) =>
              isActive || isActiveLink("/profile/transaction-reports")
                ? "active"
                : ""
            }
          >
            Reports
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;
