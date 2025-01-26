import React from "react";
import { Route } from "react-router-dom";

import LoginSignUp from "../pages/public/login-signup/LoginSignup.js";
import Home from "../pages/public/Home.js";
import Profile from "../pages/private/users/student-profile/Profile.js";
import MessagePage from "../pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "../components/myrentals/RentProgress.jsx";
import UserProfileVisit from "../components/User/BorrowerPOV/UserProfileVisit.jsx";
import NavBar2 from "../components/navbar/navbar/NavBar2.jsx";
import Footer from "../components/users/footer/Footer.jsx";
import Admin from "../pages/private/admin/Admin.js";
import AdminDashboard from "../pages/private/admin/dashboard/admindashboard/AdminDashboard.js";
import Rent from "../pages/public/Rent.js";
import Lend from "../pages/public/Lend.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminSettings from "../pages/private/admin/settings/AdminSettings.js";
import AdminLogin from "../pages/private/admin/login/AdminLogin.js";

// Post Management Dashboard - ADMIN
import PostDashboard from "../pages/private/admin/PostManagement/PostDashboard.js";
import PostOverview from "../pages/private/admin/PostManagement/PostOverview.js";
import PostApproval from "../pages/private/admin/PostManagement/PostApproval.js";

import ForSaleManagement from "../pages/private/admin/SaleManagement/ForSaleManagement.js";
import SaleOverview from "../pages/private/admin/SaleManagement/SaleOverview.js";
import ItemForSaleApproval from "../pages/private/admin/SaleManagement/ItemSaleApproval.js";
import ListingDashboard from "../pages/private/admin/listing-management/ListingDashboard.js";
import ListingOverview from "../pages/private/admin/listing-management/ListingOverview.js";
import ListingApproval from "../pages/private/admin/listing-management/ListingApproval.js";
import UserDashboard from "../pages/private/admin/user-management/UserDashboard.js";
import UserOverview from "../pages/private/admin/user-management/UserOverview.js";
import UserVerification from "../pages/private/admin/user-management/student-profile/UserVerification.js";
import ReportDashboard from "../pages/private/admin/ReportManagement/ReportDashboard.js";
import ReportOverview from "../pages/private/admin/ReportManagement/ReportOverview.js";
import ReportItemView from "../pages/private/admin/ReportManagement/ReportItemView.js";
import AdminTransactionDashboard from "../pages/private/admin/TransactionManagement/AdminTransactionDashboard.js";
import AdminTransactionOverview from "../pages/private/admin/TransactionManagement/AdminTransactionOverview.js";
import ViewTransaction from "../pages/private/admin/TransactionManagement/ViewTransaction.js";

import ProtectedRoute from "../components/Protected Route/ProtectedRoute.js";
import { AuthProvider } from "../context/AuthContext.js";
import StudentProtectedRoute from "../components/Protected Route/StudentProtectedRoute.js";
import EditProfile from "../pages/private/users/student-profile/EditProfile.jsx";
import MyForSale from "../pages/private/users/student-profile/MyForSale.jsx";
import MyPosts from "../pages/private/users/student-profile/MyPosts.jsx";
import MyListings from "../pages/private/users/student-profile/MyListings.jsx";
import MyTransactions from "../pages/private/users/student-profile/MyTransactions.jsx";
import MyRentals from "../components/myrentals/MyRentals.jsx";
import { SocketProvider } from "../context/SocketContext.js";
import Trial from "../pages/public/login-signup/Trial.js";
import ChatAndNotif from "../trialOnMessage&Notification/ChatAndNotif.jsx";
import Trial2 from "../pages/public/login-signup/Trial2.js";
import FAB from "../components/common/fab/FAB.jsx";
import Cart from "../pages/private/users/cart/Cart.js";
import PostDetail from "../pages/public/post/PostDetail.js";
import ListingDetail from "../pages/public/listing/listing-detail/ListingDetail.js";
import ItemForSaleDetail from "../pages/public/item-for-sale/ItemForSaleDetail.js";
import AddNewLItem from "../pages/private/users/item/AddNewItem.js";
import AddNewPost from "../pages/private/users/post/AddNewPost.js";
import EditItem from "../pages/private/users/item/EditItem.js";

const StudentProtectedRoutes = [
  <Route path="/cart" element={<Cart />} />,
  <Route
    path="/post/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <PostDetail />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/rent/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <ListingDetail />
      </StudentProtectedRoute>
    }
  />,
  <Route
    path="/shop/:id"
    element={
      <StudentProtectedRoute allowedRoles="student">
        <ItemForSaleDetail />
      </StudentProtectedRoute>
    }
  />,
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
