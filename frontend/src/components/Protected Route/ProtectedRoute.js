import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode"; // Correct import

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { adminUser } = useAuth();

  // Check if the token is expired
  const isTokenExpired = () => {
    if (!adminUser?.token) return true; // No token, consider it expired
    try {
      const decodedToken = jwtDecode(adminUser.token); // Use jwtDecode
      const currentTime = Date.now() / 1000; // Convert to seconds
      return decodedToken.exp < currentTime; // Token is expired if exp < current time
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Consider the token expired if there's an error
    }
  };

  // Check if the user is logged in, has an allowed role, and the token is not expired
  const hasAccess =
    adminUser && allowedRoles.includes(adminUser.role) && !isTokenExpired();

  // If not logged in, no access, or token expired, redirect to admin login
  if (!hasAccess) {
    return <Navigate to="/admin-login" />;
  }

  // Render the outlet (the child routes)
  return children;
};

export default ProtectedRoute;
