import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/sidebar/AdminSidebar";
import AdminNavBar from "../../../components/admin/navbar/AdminNavBar";
import "./adminStyles.css";

const Admin = () => {
  const isAdminLoggedIn = false;

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" />;
  }

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
