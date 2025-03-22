import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { adminUser, refreshAdminToken, logoutAdmin } = useAuth(); // Get user, refresh function, and logout function from AuthContext
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
          // Token has expired, check if a refresh token is available
          if (!adminUser?.refreshToken) {
            // No refresh token, force logout and restrict access
            setHasAccess(false);
            setLoading(false);
            return;
          }

          // Attempt to refresh the token
          const newToken = await refreshAdminToken();

          if (!newToken) {
            // If refreshing failed, ensure the admin is logged out and restrict access
            if (adminUser) logoutAdmin(); // Ensure logout happens only once
            setHasAccess(false);
          } else {
            // If refresh was successful, check access again
            setHasAccess(allowedRoles.includes(adminUser.role));
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
  }, [adminUser, allowedRoles, refreshAdminToken, logoutAdmin]);

  // Show a loading message while checking the token
  if (loading) {
    return <div>Loading...</div>;
  }

  return hasAccess ? children : <Navigate to="/admin-login" />;
};

export default ProtectedRoute;
