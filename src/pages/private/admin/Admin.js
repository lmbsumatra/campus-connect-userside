import { Outlet } from "react-router-dom";
import AdminSidebar from "../../../components/admin/sidebar/AdminSidebar";
import AdminNavBar from "../../../components/admin/navbar/AdminNavBar";
import "./adminStyles.css";

const Admin = () => {
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
