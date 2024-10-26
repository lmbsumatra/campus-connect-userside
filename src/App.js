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
import MessagePage from "./pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "./components/myrentals/MyRentals.jsx";
import UserProfileVisit from "./components/User/BorrowerPOV/UserProfileVisit.jsx";
import ViewItem from "./components/listings/ViewItem";
import AddItem from "./pages/private/users/AddItem.js";
import NavBar2 from "./components/navbar/navbar/NavBar2.jsx";
import Footer from "./components/users/footer/Footer.jsx";
import Admin from "./pages/private/admin/Admin.js";
import AdminDashboard from "./pages/private/admin/dashboard/AdminDashboard.js";
import Rent from "./pages/public/Rent.js";
import Lend from "./pages/public/Lend.js";
import Shop from "./pages/public/Shop.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminSettings from "./pages/private/admin/settings/AdminSettings.js";
import AdminLogin from "./pages/private/admin/login/AdminLogin.js";

import PostDashboard from "./pages/private/admin/dashboard/PostManagement/PostDashboard.js";
import PostOverview from "./pages/private/admin/dashboard/PostManagement/PostOverview.js";

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
        <Route path="/lend/:id" element={<ViewPost />} />
        <Route path="/rent/:id" element={<ViewItem />} />
        <Route path="/new-post" element={<PostForm />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/messages" element={<MessagePage />} />
        {/* USER PROFILE */}
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/rent-progress" element={<RentProgress />} />
        <Route path="/user/:id" element={<UserProfileVisit />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<Admin />}>
          <Route path="*" element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="posts" element={<PostDashboard />} />
          <Route path="/admin/post-overview" element={<PostOverview />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      {showNavbarAndFooter && <Footer />}
    </>
  );
}

export default App;
