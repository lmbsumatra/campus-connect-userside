import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // Check if the user is logged in and has an allowed role
  const hasAccess = user && allowedRoles.includes(user.role);

  // If not logged in or no access, redirect to admin login
  if (!hasAccess) {
    return <Navigate to="/admin-login" />;
  }

  // Render the outlet (the child routes)
  return <Outlet />;
};

export default ProtectedRoute;
