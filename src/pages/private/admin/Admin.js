import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/sidebar/AdminSidebar";
import AdminNavBar from "../../../components/admin/navbar/AdminNavBar";
import "./adminStyles.css";
import { useAuth } from "../../../context/AuthContext";

const Admin = () => {
  const { adminUser } = useAuth(); 
  console.log("Admin Component Loaded", adminUser); // Check if this is firing

  // Redirect if the user is not logged in
  if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
    console.log("Redirecting to login, user not authorized"); // Check if this fires
    return <Navigate to="/admin-login" />;
  }

  console.log("Rendering Admin Layout"); // Confirm layout rendering

  return (
    <div className="admin-container d-flex w-100">
      <AdminSidebar />
      <main className="w-100">
        <div className="admin-content">
          <AdminNavBar />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
