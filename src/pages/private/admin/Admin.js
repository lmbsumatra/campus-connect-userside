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
    console.log("Initializing admin socket connection...");
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
  
    console.log("Emitting admin-connect...");
    newSocket.emit("admin-connect");
  
    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id);
    });
  
    newSocket.on("new-listing-notification", (notification) => {
      console.log("Received listing notification in admin:", notification);
      toast.info(
        <span>
          <strong>{notification.title}</strong>: <em>{notification.owner.name}</em> {notification.message}
        </span>
      );
    });
  
    newSocket.on("new-item-for-sale-notification", (notification) => {
      console.log("Received item-for-sale notification in admin:", notification);
      toast.info(
        <span>
          <strong>{notification.title}</strong>: <em>{notification.owner.name}</em> {notification.message}
        </span>
      );
    });
  
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  
    return () => {
      console.log("Cleaning up socket connection...");
      newSocket.disconnect();
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
          <ToastContainer position="bottom-right" autoClose={5000} />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
