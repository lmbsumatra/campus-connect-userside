import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/sidebar/AdminSidebar";
import AdminNavBar from "../../../components/admin/navbar/AdminNavBar";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";
import "./adminStyles.css";
import { baseApi } from "../../../utils/consonants";

const Admin = () => {
  const { adminUser } = useAuth();
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(`${baseApi}`, {
      transports: ["polling", "websocket"],
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Auto-hide sidebar on mobile
      if (mobile) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${baseApi}/api/notifications`);
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      }
    };

    if (adminUser) {
      fetchNotifications();
    }
  }, [adminUser]);

  // Handle socket connections and notifications
  useEffect(() => {
    if (socket && adminUser) {
      // Emit admin connection
      socket.emit("admin-connect");

      socket.on("connect", () => {
        // console.log("Socket connected with ID:", socket.id);
      });

      // Generic notification handler
      const handleNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);

        // Determine the notification format based on type
        let toastContent;
        if (notification.type === "new-post") {
          toastContent = (
            <span>
              <strong>{notification.title}</strong>: {notification.renter?.name}
              <em>{notification.message}</em>
            </span>
          );
        } else {
          toastContent = (
            <span>
              <strong>{notification.title}</strong>:{" "}
              <em>{notification.owner?.name}</em> {notification.message}
            </span>
          );
        }

        toast.info(toastContent);
      };

      // Set up event listeners
      socket.on("new-listing-notification", (notification) => {
        // console.log("Received listing notification:", notification);
        handleNotification({ ...notification, type: "listing" });
      });

      socket.on("new-item-for-sale-notification", (notification) => {
        // console.log("Received item-for-sale notification:", notification);
        handleNotification({ ...notification, type: "item-for-sale" });
      });

      socket.on("new-post-notification", (notification) => {
        // console.log("Received post notification:", notification);
        handleNotification({ ...notification, type: "new-post" });
      });

      socket.on("disconnect", () => {
        // console.log("Socket disconnected");
        toast.warn("Lost connection to server. Reconnecting...");
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
        toast.error("Connection error occurred");
      });

      // Cleanup event listeners
      return () => {
        socket.off("connect");
        socket.off("new-listing-notification");
        socket.off("new-item-for-sale-notification");
        socket.off("new-post-notification");
        socket.off("disconnect");
        socket.off("error");
      };
    }
  }, [socket, adminUser]);

  // Authentication check
  if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
    return <Navigate to="/admin-login" />;
  }

  return (
    <div className="admin-container d-flex w-100">
      <div
        className={`sidebar-container ${
          !isSidebarVisible && isMobile ? "sidebar-hidden" : ""
        }`}
      >
        <AdminSidebar />
      </div>
      {isMobile && isSidebarVisible && (
        <div className="sidebar-overlay active" onClick={toggleSidebar}></div>
      )}
      <main className={`w-100 ${isMobile ? "mobile-view" : ""}`}>
        <div className="admin-content">
          <AdminNavBar
            toggleSidebar={toggleSidebar}
            notifications={notifications}
            setNotifications={setNotifications}
          />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
