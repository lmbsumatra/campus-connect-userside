import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { baseApi } from "../utils/consonants";
import ShowAlert from "../utils/ShowAlert";
import { useDispatch } from "react-redux";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [studentUser, setStudentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(() => {
    const savedUser = localStorage.getItem("adminUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const dispatch = useDispatch();

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
    // console.log("User logged in:", newUser);
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
    lastName,
    permissionLevel
  ) => {
    const newUser = {
      role,
      token,
      refreshToken,
      userId,
      firstName,
      lastName,
      permissionLevel,
    };
    setAdminUser(newUser);
    localStorage.setItem("adminUser", JSON.stringify(newUser));
    // console.log("Admin logged in:", newUser);
  };

  // ✅ Fixed missing closing bracket for logoutAdmin
  const logoutAdmin = useCallback(
    async (forceLog = false) => {
      if (!adminUser) return;

      const lastLogoutTimestamp = localStorage.getItem("lastLogoutTimestamp");
      const now = Date.now();

      // ✅ Allow forced logout logging even if within cooldown
      if (
        !forceLog &&
        lastLogoutTimestamp &&
        now - lastLogoutTimestamp < 5000
      ) {
        console.warn("Logout event ignored: Cooldown active.");
        return;
      }

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
          // ✅ Store timestamp of the last successful logout log
          localStorage.setItem("lastLogoutTimestamp", now);
        }
      } catch (error) {
        console.error("Error logging logout event:", error);
      }

      // ✅ Proceed with logout even if logging fails
      setAdminUser(null);
      localStorage.removeItem("adminUser");
    },
    [adminUser]
  );

  // ✅ Fixed misplaced closing bracket for refreshAdminToken
  const refreshAdminToken = useCallback(async () => {
    const storedAdminUser = JSON.parse(localStorage.getItem("adminUser"));
    if (!storedAdminUser || !storedAdminUser.refreshToken) return null;

    try {
      const response = await fetch(`${baseApi}/admin/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedAdminUser.token}`,
        },
        body: JSON.stringify({ refreshToken: storedAdminUser.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      if (!data.token || !data.refreshToken) {
        throw new Error("Invalid token data received");
      }

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

      // ✅ Force log at least one logout entry
      const lastLogoutTimestamp = localStorage.getItem("lastLogoutTimestamp");
      const now = Date.now();

      if (!lastLogoutTimestamp || now - lastLogoutTimestamp > 5000) {
        localStorage.setItem("lastLogoutTimestamp", now);
        logoutAdmin(true); // ✅ Force at least one logout log
      }

      return null;
    }
  }, [logoutAdmin]); // ✅ Dependencies added properly

  const checkPermissionStatus = useCallback(async () => {
    if (!adminUser?.token || adminUser.role === "superadmin") return;

    try {
      const response = await fetch(`${baseApi}/admin/check-permission`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to check permission status.");
        return;
      }

      const data = await response.json();

      if (data.permissionLevel === "DeniedAccess") {
        alert(
          "Your access has been revoked by the superadmin. You will be logged out."
        );
        logoutAdmin(true);
      }
    } catch (error) {
      console.error("Permission check failed:", error);
    }
  }, [adminUser, logoutAdmin]);

  useEffect(() => {
    if (!adminUser?.token) return;

    const interval = setInterval(() => {
      checkPermissionStatus();
    }, 60000); // Check every 60 seconds

    checkPermissionStatus(); // Immediate check on mount

    return () => clearInterval(interval);
  }, [adminUser, checkPermissionStatus]);

  // Auto-refresh token on app start
  useEffect(() => {
    const autoRefreshToken = async () => {
      if (!adminUser?.token || !adminUser?.refreshToken) return;

      try {
        const decodedToken = jwtDecode(adminUser.token);
        const currentTime = Date.now() / 1000;
        const buffer = 30; // 30 seconds buffer

        // Refresh if token is expired or about to expire
        if (decodedToken.exp < currentTime + buffer) {
          console.log("Token needs refresh, attempting...");
          const newToken = await refreshAdminToken();

          if (!newToken) {
            // console.log("Refresh failed on app start, logging out...");
            logoutAdmin();
          }
        }
      } catch (error) {
        console.error("Error in token check:", error);
        logoutAdmin();
      }
    };

    // Check every minute
    const interval = setInterval(autoRefreshToken, 60000);
    autoRefreshToken(); // Run immediately on mount

    return () => clearInterval(interval);
  }, [adminUser, logoutAdmin, refreshAdminToken]); // ✅ Now properly includes dependencies

  useEffect(() => {
    let timeout;
    let activityDebounce;
    let isLoggedOut = false;

    const resetTimeout = () => {
      if (isLoggedOut) return;

      clearTimeout(activityDebounce);
      activityDebounce = setTimeout(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (isLoggedOut) return;
          isLoggedOut = true; // Prevent multiple logouts

          // Show logout alert
          ShowAlert(
            dispatch,
            "error",
            "Session Expired",
            "You have been automatically logged out due to 15 minutes of inactivity.",
            {
              text: "OK",
              action: () => logoutAdmin(true),
            }
          ).then(() => {
            logoutAdmin(true);
          });
        }, 15 * 60 * 1000);
      }, 200);
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimeout));

    resetTimeout(); // Start the timer

    return () => {
      clearTimeout(timeout);
      clearTimeout(activityDebounce);
      events.forEach((e) => window.removeEventListener(e, resetTimeout));
    };
  }, [logoutAdmin, dispatch]);

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
