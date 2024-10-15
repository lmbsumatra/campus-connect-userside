// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.css";
import "../src/styles/buttons.css";
import "../src/styles/icons.css";
import "../src/styles/cards.css";

import Login from "./pages/public/login-signup/LoginSignup.js";
import Home from "./pages/public/Home.js";
import Profile from "./pages/public/Profile.js";
import Posts from "./pages/public/Lend.js";
import Post from "./components/post/Post.jsx";
import PostForm from "./pages/private/new-post/PostForm.js";
import MessagePage from "./pages/private/message-inbox/MessagePage.js";
import RentProgress from "./components/myrentals/RentProgress.jsx";
import UserProfileVisit from "./components/User/BorrowerPOV/UserProfileVisit.jsx";
import Listings from "./pages/public/Rent.js";
import ViewItem from "./components/listings/ViewItem";
import AddItem from "./pages/private/AddItem.js";
import LoginSignUp from "./pages/public/login-signup/LoginSignup.js";
import NavBar from "./components/navbar/navbar/NavBar.jsx";
import Shop from "./pages/public/Shop.js";
import Rent from "./pages/public/Rent.js";
import Lend from "./pages/public/Lend.js";
import ViewPost from "./pages/private/ViewPost.js";
import Footer from "./components/footer/Footer.jsx";

function App() {
  return (
    <BrowserRouter>
      <NavBar /> {/* Include the Navbar */}
      <Routes>
        {/* PUBLIC ROUTES */}
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
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/rent-progress" element={<RentProgress />} />
        <Route path="/user/:id" element={<UserProfileVisit />} />
        
      </Routes>
      <Footer /> {/* Include the Navbar */}
    </BrowserRouter>
  );
}

export default App;
