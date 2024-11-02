import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentProtectedRoute = ({ allowedRoles, children }) => {
  const { studentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (studentUser === null) {
    return <Navigate to="/" />; 
  }

  const { role } = studentUser;
  console.log(studentUser)

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default StudentProtectedRoute;
