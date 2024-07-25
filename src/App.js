import React from "react";
import "./App.css";

import Home from "./pages/public/Home.js";
import Profile from "./pages/public/Profile.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/*" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
