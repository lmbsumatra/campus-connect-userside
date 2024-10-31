import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React from "react";
import "./App.css";
import "../src/styles/buttons.css";
import "../src/styles/icons.css";
import "../src/styles/cards.css";
import "../src/styles/containers.css";

import LoginSignUp from "./pages/public/login-signup/LoginSignup.js";
import Home from "./pages/public/Home.js";
import Profile from "./pages/private/users/Profile.js";
import ViewPost from "./pages/private/users/ViewPost.js";
import PostForm from "./pages/private/users/new-post/PostForm.js";
import AddPost from "./pages/private/users/new-posting/AddPost.js";
import MessagePage from "./pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "./components/myrentals/MyRentals.jsx";
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
import ViewItem from "./pages/private/users/ViewItem.js"

//Post Management Dashboard - ADMIN
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
import UserVerification from "./pages/private/admin/user-management/UserVerification.js";

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId="474440031362-3ja3qh8j5bpn0bfs1t7216u8unf0ogat.apps.googleusercontent.com">
        <Content />
      </GoogleOAuthProvider>
    </BrowserRouter>
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
        <Route path="/lend/:id" element={<div className="container-content"><ViewPost /></div>} />
        <Route path="/rent/:id" element={<div className="container-content"><ViewListing /></div>} />
        <Route path="/item-for-sale/:id" element={<div className="container-content"><ViewItem/></div>} />

        <Route path="/new-post2" element={<PostForm />} />
        <Route path="/new-post" element={<AddPost />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/messages" element={<MessagePage />} />

        {/* USER PROFILE */}
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/rent-progress" element={<RentProgress />} />
        <Route path="/user/:id" element={<UserProfileVisit />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<Admin />}>
          <Route path="*" element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* USER MANAGEMENT */}
          <Route path="users" element={<UserDashboard />} />
          <Route path="users/user-overview" element={<UserOverview />} />
          <Route path="users/user-verification/:id" element={<UserVerification />} />
          {/* LISTING */}
          <Route path="listings" element={<ListingDashboard />} />
          <Route path="listings/listing-overview" element={<ListingOverview/>} />
          <Route path="listings/listing-approval/:id" element={<ListingApproval />} />
          {/* POSTS */}
          <Route path="posts" element={<PostDashboard />} />
          <Route path="posts/post-overview" element={<PostOverview />} />
          <Route path="posts/post-approval/:id" element={<PostApproval />} />
          {/* ITEM FOR SALE */}
          <Route path="sales" element={<ForSaleManagement />} />
          <Route path="sales/sales-overview" element={<SaleOverview />} />
          <Route path="sales/item-approval/:id" element={<ItemForSaleApproval />} />
          {/* ADMIN MANAGEMENT */}
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      {showNavbarAndFooter && <Footer />}
    </>
  );
}

export default App;
