// modules
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.css";
import "../src/styles/buttons.css";
import "../src/styles/icons.css";

import Home from "./pages/public/Home.js";
import Profile from "./pages/public/Profile.js";
import Posts from "./pages/public/Posts.js";
import Post from "./components/post/Post.jsx";
import PostForm from "./pages/private/new-post/PostForm.js";
import MessagePage from "./pages/private/message-inbox/MessagePage.js";
import RentProgress from "./components/myrentals/RentProgress.jsx";
import UserProfileVisit from "./components/User/BorrowerPOV/UserProfileVisit.jsx";
import Listings from "./pages/public/Listing.js";
import ViewItem from "./components/listings/ViewItem";
import AddItem from "./components/listings/AddItem.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<Post />} />
        <Route path="/new-post" element={<PostForm />} />
        <Route path="/messages" element={<MessagePage />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/rent-progress" element={<RentProgress />} />
        <Route path="/user/:id" element={<UserProfileVisit />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/item/:id" element={<ViewItem />} />
        <Route path="/add-item" element={<AddItem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
