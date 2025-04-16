import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice";
import ShowAlert from "../../utils/ShowAlert";
import LoadingOverlay from "../loading-overlay/LoadingOverlay";

const StudentProtectedRoute = ({
  allowedRoles,
  requireRepresentative = false,
  children,
}) => {
  const studentUser = useSelector(selectStudentUser);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const isRepresentative = user?.user?.isRepresentative || false;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!studentUser) {
    ShowAlert(dispatch, "warning", "Please login first!");
    return <Navigate to="/" replace />;
  }

  const { role } = studentUser;
  console.log(isRepresentative);

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  if (requireRepresentative && !isRepresentative) {
    ShowAlert(
      dispatch,
      "warning",
      "Access Denied",
      "You must be a representative to access this page."
    );
    return <Navigate to="/profile/dashboard" replace />;
  }

  return children || <Outlet />;
};

export default StudentProtectedRoute;
