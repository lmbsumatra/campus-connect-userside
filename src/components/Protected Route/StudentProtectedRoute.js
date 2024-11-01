import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a delay (e.g., for fetching user data)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay as needed

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  // After loading, check if user is null
  if (user === null) {
    return <Navigate to="/" />; // Redirect to login if not logged in
  }

  const { role } = user;

  // Check if the user's role is allowed
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default StudentProtectedRoute;
