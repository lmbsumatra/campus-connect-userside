import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { adminUser } = useAuth();

  // Check if the user is logged in and has an allowed role
  const hasAccess = adminUser && allowedRoles.includes(adminUser.role);

  // If not logged in or no access, redirect to admin login
  if (!hasAccess) {
    return <Navigate to="/admin-login" />;
  }

  // Render the outlet (the child routes)
  return children;
};

export default ProtectedRoute;
