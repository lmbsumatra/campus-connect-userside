import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/sidebar/AdminSidebar";
import AdminNavBar from "../../../components/admin/navbar/AdminNavBar";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";
import useSocket from "../../../hooks/useSocket"; // Import the custom hook
import "./adminStyles.css";
import { io } from "socket.io-client";

const Admin = () => {
  const { adminUser } = useAuth();
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const socket = io("http://localhost:3001", {
    transports: ["polling", "websocket"],
  });

  useEffect(() => {
    if (socket) {
      // Emit the admin connection event when socket is initialized
      socket.emit("admin-connect");

      socket.on("connect", () => {
        console.log("Socket connected with ID:", socket.id);
      });
      // listener for new-listi notifications
      socket.on("new-listing-notification", (notification) => {
        console.log("Received listing notification in admin:", notification);
        toast.info(
          <span>
            <strong>{notification.title}</strong>:{" "}
            <em>{notification.owner.name}</em> {notification.message}
          </span>
        );
      });

      // listener for new-item-for-sale notifications
      socket.on("new-item-for-sale-notification", (notification) => {
        console.log(
          "Received item-for-sale notification in admin:",
          notification
        );
        toast.info(
          <span>
            <strong>{notification.title}</strong>:{" "}
            <em>{notification.owner.name}</em> {notification.message}
          </span>
        );
      });

      // listener for new post notifications
      socket.on("new-post-notification", (notificationData) => {
        console.log("Received post notification in admin:", notificationData);
        toast.info(
          <span>
            <strong>{notificationData.title}</strong>:{" "}
            {notificationData.renter.name}
            <em>{notificationData.message}</em>
          </span>
        );
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    }

    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]); // Adding `socket` as dependency to manage lifecycle

  useEffect(() => {
    const handleResize = () => {
      setSidebarVisible(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
    return <Navigate to="/admin-login" />; // Redirect if not logged in or not an admin
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
