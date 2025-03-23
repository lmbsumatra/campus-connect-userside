import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { baseApi } from "../utils/consonants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
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

  const loginStudent = (token, role, userId) => {
    const newUser = { role, token, userId };
    setStudentUser(newUser);
    localStorage.setItem("studentUser", JSON.stringify(newUser));
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
  };

  const logoutAdmin = useCallback(async () => {
    if (!adminUser || isLoggingOut) return; // Prevent multiple calls

    setIsLoggingOut(true); // Set logging out state

    const logoutData = {
      admin_id: adminUser.userId,
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
    } finally {
      setIsLoggingOut(false);
    }

    setAdminUser(null);
    localStorage.removeItem("adminUser");
  }, [adminUser, isLoggingOut]);

  const refreshAdminToken = useCallback(async () => {
    if (!adminUser?.refreshToken || adminUser.isRefreshing || isTokenRefreshing)
      return null;

    setIsTokenRefreshing(true); // Set token refreshing state

    try {
      const response = await fetch(`${baseApi}/admin/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: adminUser.refreshToken }),
      });

      if (!response.ok) {
        await logoutAdmin(); // Ensure logout is called only once
        return null;
      }

      const data = await response.json();
      setAdminUser((prev) => ({
        ...prev,
        token: data.token,
        refreshToken: data.refreshToken,
        isRefreshing: false,
      }));

      return data.token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      await logoutAdmin(); // Ensure logout is called only once
      return null;
    } finally {
      setIsTokenRefreshing(false); // Reset token refreshing state
    }
  }, [adminUser, logoutAdmin, isTokenRefreshing]);

  useEffect(() => {
    const autoRefreshToken = async () => {
      if (!adminUser?.refreshToken || isTokenRefreshing) return; // Do nothing if refresh is already in progress

      try {
        const decodedToken = jwtDecode(adminUser.token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          const newToken = await refreshAdminToken();

          if (!newToken) {
            await logoutAdmin();
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        await logoutAdmin();
      }
    };

    autoRefreshToken();
  }, [adminUser, logoutAdmin, refreshAdminToken, isTokenRefreshing]);

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
