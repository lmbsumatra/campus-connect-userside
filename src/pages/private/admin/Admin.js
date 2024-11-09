import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/sidebar/AdminSidebar";
import AdminNavBar from "../../../components/admin/navbar/AdminNavBar";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";
import io from "socket.io-client";
import "./adminStyles.css";

const Admin = () => {
  const { adminUser } = useAuth();
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection when the component mounts
    const newSocket = io("http://localhost:3001"); // Use your backend server URL
    setSocket(newSocket);

    // Listen for new listing notifications
    newSocket.on("new-listing-notification", (notification) => {
      // Trigger the toast notification for new listing
      toast.info(`${notification.title}: ${notification.message}`);
    });

    return () => {
      newSocket.disconnect(); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSidebarVisible(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
    return <Navigate to="/admin-login" />;
  }

  return (
    <div className="admin-container d-flex w-100">
      {isSidebarVisible && <AdminSidebar />}
      <main className="w-100">
        <div className="admin-content">
          <AdminNavBar />
          <ToastContainer position="top-right" autoClose={5000} />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
