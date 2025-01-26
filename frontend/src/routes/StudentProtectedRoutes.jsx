import React from "react";
import { Route } from "react-router-dom";

import Profile from "../pages/private/users/student-profile/Profile.js";
import MessagePage from "../pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "../components/myrentals/RentProgress.jsx";
import UserProfileVisit from "../components/User/BorrowerPOV/UserProfileVisit.jsx";
import StudentProtectedRoute from "../components/Protected Route/StudentProtectedRoute.js";
import Cart from "../pages/private/users/cart/Cart.js";
import PostDetail from "../pages/public/post/PostDetail.js";
import ListingDetail from "../pages/public/listing/listing-detail/ListingDetail.js";
import ItemForSaleDetail from "../pages/public/item-for-sale/ItemForSaleDetail.js";
import AddNewLItem from "../pages/private/users/item/AddNewItem.js";
import AddNewPost from "../pages/private/users/post/AddNewPost.js";
import EditItem from "../pages/private/users/item/EditItem.js";

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
    path="/post/edit/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <EditItem />
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
      <StudentProtectedRoute allowedRoles="student">
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
    path="/rent-progress/:id"
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
];

export default StudentProtectedRoutes;
