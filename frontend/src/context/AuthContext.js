import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { baseApi } from "../App";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [studentUser, setStudentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(() => {
    const savedUser = localStorage.getItem("adminUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const storedAdminUser = localStorage.getItem("adminUser");
    if (storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser));
    }
  }, []);

  useEffect(() => {
    const storedStudentUser = localStorage.getItem("studentUser");
    if (storedStudentUser) {
      setStudentUser(JSON.parse(storedStudentUser));
    }
  }, []);

  useEffect(() => {
    if (adminUser?.token) {
      const decodedToken = jwtDecode(adminUser.token);
      const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      if (expirationTime < currentTime) {
        // Token is already expired, log out the user
        logoutAdmin();
      } else {
        // Refresh the token 10 minutes before it expires
        const timeUntilExpiration = expirationTime - currentTime;
        const refreshTimeout = setTimeout(() => {
          refreshAdminToken();
        }, timeUntilExpiration - 10 * 60 * 1000); // 10 minutes before expiration

        return () => clearTimeout(refreshTimeout);
      }
    }
  }, [adminUser]);

  const loginStudent = (token, role, userId) => {
    const newUser = { role, token, userId };
    setStudentUser(newUser);
    localStorage.setItem("studentUser", JSON.stringify(newUser));
    console.log("User logged in:", newUser);
  };

  const logoutStudent = () => {
    setStudentUser(null);
    localStorage.removeItem("studentUser");
  };

  const loginAdmin = (
    token,
    refreshToken,
    role,
    userId,
    firstName,
    lastName
  ) => {
    const newUser = { role, token, refreshToken, userId, firstName, lastName };
    setAdminUser(newUser);
    localStorage.setItem("adminUser", JSON.stringify(newUser));
    console.log("Admin logged in:", newUser);
  };

  const logoutAdmin = async () => {
    if (!adminUser) return;

    const logoutData = {
      admin_id: adminUser.userId, // Ensure this matches your DB field
      role: adminUser.role,
      action: "Logout",
      endpoint: "/admin/logout",
      details: `${adminUser.firstName} ${adminUser.lastName} logged out`,
    };

    try {
      const response = await fetch(`${baseApi}/admin/audit-logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logoutData),
      });

      if (!response.ok) {
        console.error("Failed to log logout event:", await response.text());
      } else {
        console.log("Logout event logged successfully");
      }
    } catch (error) {
      console.error("Error logging logout event:", error);
    }

    // Proceed with logout even if logging fails
    console.log("Logging out admin...");
    setAdminUser(null);
    localStorage.removeItem("adminUser");
  };

  const refreshAdminToken = async () => {
    const storedAdminUser = JSON.parse(localStorage.getItem("adminUser"));
    if (!storedAdminUser || !storedAdminUser.refreshToken) return null;

    try {
      const response = await fetch(`${baseApi}/admin/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: storedAdminUser.refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to refresh token");
      }

      const data = await response.json();
      console.log("New tokens received at:", new Date().toLocaleString());
      // console.log("New Access Token:", data.token);
      // console.log("New Refresh Token:", data.refreshToken);
      // console.log("New tokens received:", data);

      const newUser = {
        ...storedAdminUser,
        token: data.token,
        refreshToken: data.refreshToken,
      };
      setAdminUser(newUser);
      localStorage.setItem("adminUser", JSON.stringify(newUser));
      return data.token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logoutAdmin();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        studentUser,
        loginStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
        refreshAdminToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
