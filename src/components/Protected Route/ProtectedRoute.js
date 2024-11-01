import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleHierarchy = { student: 1, admin: 2, superadmin: 3 }; // Hierarchical roles

const ProtectedRoute = ({ requiredRole }) => {
  const { user } = useAuth();

  if (!user || roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    return <Navigate to="/admin-login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
