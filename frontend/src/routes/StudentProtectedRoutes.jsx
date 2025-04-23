import React from "react";
import { Route } from "react-router-dom";

import Profile from "../pages/private/users/student-profile/Profile.js";
import MessagePage from "../pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "../components/myrentals/RentProgress.jsx";
import UserProfileVisit from "../pages/private/users/other-user-profile/UserProfileVisit.jsx";
import StudentProtectedRoute from "../components/Protected Route/StudentProtectedRoute.js";
import AddNewLItem from "../pages/private/users/item/AddNewItem.js";
import AddNewPost from "../pages/private/users/post/AddNewPost.js";
import EditItem from "../pages/private/users/item/EditItem.js";
import SuccessPayment from "../pages/private/users/success-payment/SuccessPayment.js";
import CancelPayment from "../pages/private/users/cancel-payment/CancelPayment.js";
import RentalReportDetails from "../components/report/RentalReportDetails.js";
import PaymentPage from "../pages/public/PaymentPage.js";
import EditPost from "../pages/private/users/post/EditPost.js";
import BuySlotPage from "../pages/public/BuySlotPage.js";

const StudentProtectedRoutes = [
  <Route
    path="/profile/my-posts/new"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <AddNewPost />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/profile/my-posts/edit/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <EditPost />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/profile/my-listings/add"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <AddNewLItem />
      </StudentProtectedRoute>
    }
  />,

  <Route
    path="/profile/my-listings/edit/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <EditItem />
      </StudentProtectedRoute>
    }
  />,

  <Route
    path="/profile/my-for-sale/edit/:id"
    element={
      <StudentProtectedRoute allowedRoles="student" requireRepresentative={true}>
        <EditItem />
      </StudentProtectedRoute>
    }
  />,

  <Route
    path="/messages"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <MessagePage />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/messages/:conversationId"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <MessagePage />
      </StudentProtectedRoute>
    }
  />,

  <Route
    path="/profile/*"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <Profile />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/transaction-progress/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <RentProgress />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/user/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <UserProfileVisit />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/buy-slot"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <BuySlotPage />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/payment"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <PaymentPage />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/payment-success"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <SuccessPayment />
      </StudentProtectedRoute>
    }
  />,

  <Route
    path="/payment-cancelled"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <CancelPayment />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/reports/:reportId"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <RentalReportDetails />
      </StudentProtectedRoute>
    }
  />,
];

export default StudentProtectedRoutes;
