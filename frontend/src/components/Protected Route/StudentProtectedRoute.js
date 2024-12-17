import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice"; // Adjust the path as needed

const StudentProtectedRoute = ({ allowedRoles, children }) => {
  // Use useSelector to get studentUser from Redux store
  const studentUser = useSelector(selectStudentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // You can adjust or remove this loading time as necessary

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  if (studentUser === null) {
    return <Navigate to="/" />; // Redirect if no student user
  }

  const { role } = studentUser;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />; // Redirect if role is not allowed
  }

  return children; // If everything checks out, render the protected route's children
};

export default StudentProtectedRoute;
