import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { adminUser, refreshAdminToken } = useAuth(); // Get user and refresh function from AuthContext
  const [loading, setLoading] = useState(true); // Loading state to prevent redirection before checking everything
  const [hasAccess, setHasAccess] = useState(false); // State to track if user has access

  useEffect(() => {
    const checkAccess = async () => {
      if (!adminUser?.token) {
        // If no token, user is not logged in → Redirect to login
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(adminUser.token); // Decode the JWT to check expiration
        const currentTime = Date.now() / 1000; // Get current time in seconds

        if (decodedToken.exp < currentTime) {
          // If token is expired, try refreshing it
          console.log("Token expired, trying to refresh...");
          const newToken = await refreshAdminToken();

          if (newToken) {
            // If refresh was successful, allow access
            console.log("Token refreshed successfully.");
            setHasAccess(allowedRoles.includes(adminUser.role));
          } else {
            // If refresh failed, redirect to login
            console.log("Refresh failed, logging out...");
            setHasAccess(false);
          }
        } else {
          // If token is still valid, allow access
          setHasAccess(allowedRoles.includes(adminUser.role));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setHasAccess(false);
      }

      setLoading(false); // Done checking, remove loading state
    };

    checkAccess();
  }, [adminUser, allowedRoles, refreshAdminToken]);

  // Show a loading message while checking the token
  if (loading) {
    return <div>Loading...</div>;
  }

  return hasAccess ? children : <Navigate to="/admin-login" />;
};

export default ProtectedRoute;
