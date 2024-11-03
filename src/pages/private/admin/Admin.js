import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/sidebar/AdminSidebar";
import AdminNavBar from "../../../components/admin/navbar/AdminNavBar";
import { useEffect, useState } from "react";
import "./adminStyles.css";
import { useAuth } from "../../../context/AuthContext";

const Admin = () => {
  const { adminUser } = useAuth(); 
  console.log("Admin Component Loaded", adminUser); // Check if this is firing

  // Hook for sidebar visibility
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  // Toggle sidebar visibility based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    // Set initial sidebar visibility on mount
    handleResize();
    
    // Add event listener for resize
    window.addEventListener("resize", handleResize);
    
    // Clean up event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect if the user is not logged in
  if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
    console.log("Redirecting to login, user not authorized"); // Check if this fires
    return <Navigate to="/admin-login" />;
  }

  console.log("Rendering Admin Layout"); // Confirm layout rendering

  return (
    <div className="admin-container d-flex w-100">
      {isSidebarVisible && <AdminSidebar />}
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
