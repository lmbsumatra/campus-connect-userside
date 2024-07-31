// modules
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.css";

import Home from "./pages/public/Home.js";
import Profile from "./pages/public/Profile.js";
import Posts from "./pages/public/Posts.js";
import Post from "./components/post/Post.jsx";
import PostForm from "./pages/private/new-post/PostForm.js";
import MessagePage from "./pages/private/message-inbox/MessagePage.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<Post />} />
        <Route path="/new-post" element={<PostForm />} />
        <Route path="/messages" element={<MessagePage />} />
        <Route path="/profile/*" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
