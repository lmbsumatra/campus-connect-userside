import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import React from "react";
import "./App.css";
import "../src/styles/buttons.css";
import "../src/styles/icons.css";
import "../src/styles/cards.css";
import "../src/styles/containers.css";

import LoginSignUp from "./pages/public/login-signup/LoginSignup.js";
import Home from "./pages/public/Home.js";
import Profile from "./pages/private/users/student-profile/Profile.js";
import ViewPost from "./pages/private/users/ViewPost.js";
import PostForm from "./pages/private/users/new-post/PostForm.js";
import AddPost from "./pages/private/users/new-posting/AddPost.js";
import MessagePage from "./pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "./components/myrentals/RentProgress.jsx";
import UserProfileVisit from "./components/User/BorrowerPOV/UserProfileVisit.jsx";
import ViewListing from "./pages/private/users/ViewListing.js";
import AddListing from "./pages/private/users/new-listing/AddListing.js";
import NavBar2 from "./components/navbar/navbar/NavBar2.jsx";
import Footer from "./components/users/footer/Footer.jsx";
import Admin from "./pages/private/admin/Admin.js";
import AdminDashboard from "./pages/private/admin/dashboard/admindashboard/AdminDashboard.js";
import Rent from "./pages/public/Rent.js";
import Lend from "./pages/public/Lend.js";
import Shop from "./pages/public/Shop.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminSettings from "./pages/private/admin/settings/AdminSettings.js";
import AdminLogin from "./pages/private/admin/login/AdminLogin.js";
import ViewItem from "./pages/private/users/ViewItem.js";

// Post Management Dashboard - ADMIN
import PostDashboard from "./pages/private/admin/PostManagement/PostDashboard.js";
import PostOverview from "./pages/private/admin/PostManagement/PostOverview.js";
import PostApproval from "./pages/private/admin/PostManagement/PostApproval.js";

import ForSaleManagement from "./pages/private/admin/SaleManagement/ForSaleManagement.js";
import SaleOverview from "./pages/private/admin/SaleManagement/SaleOverview.js";
import ItemForSaleApproval from "./pages/private/admin/SaleManagement/ItemSaleApproval.js";
import ListingDashboard from "./pages/private/admin/listing-management/ListingDashboard.js";
import ListingOverview from "./pages/private/admin/listing-management/ListingOverview.js";
import ListingApproval from "./pages/private/admin/listing-management/ListingApproval.js";
import UserDashboard from "./pages/private/admin/user-management/UserDashboard.js";
import UserOverview from "./pages/private/admin/user-management/UserOverview.js";
import UserVerification from "./pages/private/admin/user-management/student-profile/UserVerification.js";

import ProtectedRoute from "./components/Protected Route/ProtectedRoute.js";
import { AuthProvider } from "./context/AuthContext.js";
import StudentProtectedRoute from "./components/Protected Route/StudentProtectedRoute.js";
import EditProfile from "./components/editprofile/EditProfile.jsx";
import MyForSale from "./pages/private/users/student-profile/MyForSale.jsx";
import MyPosts from "./pages/private/users/student-profile/MyPosts.jsx";
import MyListings from "./pages/private/users/student-profile/MyListings.jsx";
import MyTransactions from "./pages/private/users/student-profile/MyTransactions.jsx";
import MyRentals from "./components/myrentals/MyRentals.jsx";
import { SocketProvider } from "./context/SocketContext.js";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
      <BrowserRouter>
        <GoogleOAuthProvider clientId="474440031362-3ja3qh8j5bpn0bfs1t7216u8unf0ogat.apps.googleusercontent.com">
          <Content />
        </GoogleOAuthProvider>
      </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

function Content() {
  const location = useLocation();
  const showNavbarAndFooter = !location.pathname.startsWith("/admin");

  return (
    <>
      {showNavbarAndFooter && <NavBar2 className="bg-dark" />}
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login-signup" element={<LoginSignUp />} />
        <Route path="/*" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/rent" element={<Rent />} />
        <Route path="/lend" element={<Lend />} />
        <Route path="/shop" element={<Shop />} />

        {/* PRIVATE ROUTES */}

        {/* PRIVATE STUDENT ROUTES */}
        <Route
          path="/lend/:id"
          element={
            <div className="container-content">
              <StudentProtectedRoute allowedRoles="student">
                <ViewPost />
              </StudentProtectedRoute>
            </div>
          }
        />
        <Route
          path="/rent/:id"
          element={
            <div className="container-content">
              <StudentProtectedRoute allowedRoles="student">
                <ViewListing />
              </StudentProtectedRoute>
            </div>
          }
        />
        <Route
          path="/item-for-sale/:id"
          element={
            <div className="container-content">
              <StudentProtectedRoute allowedRoles="student">
                <ViewItem />
              </StudentProtectedRoute>
            </div>
          }
        />
        <Route
          path="/new-post2"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <PostForm />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/new-post"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <AddPost />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/add-listing"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <AddListing />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <MessagePage />
            </StudentProtectedRoute>
          }
        />

        {/* USER PROFILE */}
        <Route
          path="/profile/*"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <Profile />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/rent-progress/:id"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <RentProgress />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <UserProfileVisit />
            </StudentProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* USER MANAGEMENT */}
          <Route path="users" element={<UserDashboard />} />
          <Route path="users/user-overview" element={<UserOverview />} />
          <Route
            path="users/user-verification/:id"
            element={<UserVerification />}
          >
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="transactions" element={<MyTransactions />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="my-forsale-items" element={<MyForSale />} />
            <Route index path="*"  element={<MyListings />}/>
          </Route>

          {/* LISTINGS */}
          <Route path="listings" element={<ListingDashboard />} />
          <Route
            path="listings/listing-overview"
            element={<ListingOverview />}
          />
          <Route
            path="listings/listing-approval/:id"
            element={<ListingApproval />}
          />

          {/* POSTS */}
          <Route path="posts" element={<PostDashboard />} />
          <Route path="posts/post-overview" element={<PostOverview />} />
          <Route path="posts/post-approval/:id" element={<PostApproval />} />

          {/* ITEM FOR SALE */}
          <Route path="sales" element={<ForSaleManagement />} />
          <Route path="sales/sales-overview" element={<SaleOverview />} />
          <Route
            path="sales/item-approval/:id"
            element={<ItemForSaleApproval />}
          />

          {/* ADMIN MANAGEMENT */}
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Route>
      </Routes>
      {showNavbarAndFooter && <Footer />}
    </>
  );
}

export default App;
